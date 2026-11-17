"""Build positive-relief presets from the supplied Illustrator SVGs.

Run with fonttools and skia-pathops installed. SVG fill/stroke paint order is
resolved with curve-preserving Boolean operations, including dark knockout masks.
"""
from pathlib import Path
from xml.etree import ElementTree as ET
import argparse
import hashlib
import json
import math
import re
import shutil

import pathops
from fontTools.misc.transform import Transform
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.svgLib.path import parse_path

ROOT = Path(__file__).resolve().parents[1]
NUMBERS = [7, 8, 9, 10, 11, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
NAMES = {
    7: 'Nested frame', 8: 'Paired scrolls', 9: 'Fluted scroll',
    10: 'Scroll medallion', 15: 'Open scroll frame', 16: 'Framed cartouche',
    17: 'Triple scroll frame', 18: 'Wordmark and scroll', 19: 'Scroll tablet',
    20: 'Long fluted frame', 21: 'Open fluted frame', 22: 'Framed U',
    23: 'Framed scroll', 24: 'Framed wordmark', 25: 'Wordmark and fluting',
    26: 'Cartouche and scroll',
}
NUMERIC = r'[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?'


def transform(value):
    matrix = Transform()
    for name, raw in re.findall(r'(\w+)\s*\(([^)]*)\)', value or ''):
        p = [float(v) for v in re.findall(NUMERIC, raw)]
        if name == 'translate':
            local = Transform().translate(p[0], p[1] if len(p) > 1 else 0)
        elif name == 'rotate':
            local = Transform()
            if len(p) == 3:
                local = local.translate(p[1], p[2])
            local = local.rotate(math.radians(p[0]))
            if len(p) == 3:
                local = local.translate(-p[1], -p[2])
        elif name == 'scale':
            local = Transform().scale(p[0], p[1] if len(p) > 1 else p[0])
        elif name == 'matrix':
            local = Transform(*p)
        else:
            raise ValueError(f'Unsupported transform: {name}')
        matrix = matrix.transform(local)
    return matrix


def geometry(node):
    name = node.tag.split('}')[-1]
    if name == 'path':
        d = node.get('d', '')
    elif name == 'rect':
        x, y = float(node.get('x', 0)), float(node.get('y', 0))
        w, h = float(node.get('width')), float(node.get('height'))
        d = f'M{x} {y}h{w}v{h}h{-w}Z'
    elif name == 'polygon':
        points = re.findall(NUMERIC, node.get('points', ''))
        d = 'M' + ' '.join(points[:2]) + 'L' + ' '.join(points[2:]) + 'Z'
    else:
        return None
    result = pathops.Path()
    parse_path(d, result.getPen())
    return result


def read_artwork(file):
    root = ET.parse(file).getroot()
    classes = {}
    for style in root.findall('.//{*}style'):
        for selectors, body in re.findall(r'([^{}]+)\{([^{}]+)\}', style.text or ''):
            declarations = dict(re.findall(r'([\w-]+)\s*:\s*([^;]+)', body))
            for selector in selectors.split(','):
                classes.setdefault(selector.strip().lstrip('.'), {}).update(declarations)
    result = pathops.Path()
    tiles = []

    def paint(shape, colour):
        nonlocal result
        if colour in (None, 'none'):
            return
        if colour.lower() == '#7d4e39':
            operator = pathops.PathOp.UNION
        elif colour.lower() == '#6f3c28':
            operator = pathops.PathOp.DIFFERENCE
        else:
            raise ValueError(f'Unexpected artwork colour {colour} in {file.name}')
        result = pathops.op(result, shape, operator)

    def walk(node, parent_style, parent_matrix):
        name = node.tag.split('}')[-1]
        if name in ('defs', 'style'):
            return
        style = dict(parent_style)
        for cls in node.get('class', '').split():
            style.update(classes.get(cls, {}))
        style.update({k: v for k, v in node.attrib.items() if k in (
            'fill', 'fill-rule', 'stroke', 'stroke-width', 'stroke-miterlimit')})
        matrix = parent_matrix.transform(transform(node.get('transform')))
        shape = geometry(node)
        if shape is not None:
            if style.get('fill-rule') == 'evenodd':
                shape.fillType = pathops.FillType.EVEN_ODD
            fill = style.get('fill')
            if fill and fill != 'none':
                transformed = shape.transform(*matrix)
                if name == 'polygon' and fill == '#6f3c28':
                    x0, y0, x1, y1 = transformed.bounds
                    if x1-x0 > 300 and y1-y0 > 300:
                        tiles.append((x0, y0, x1, y1))
                paint(transformed, fill)
            stroke = style.get('stroke')
            if stroke and stroke != 'none':
                expanded = pathops.Path(shape)
                expanded.stroke(float(style.get('stroke-width', 1).replace('px', '')),
                                pathops.LineCap.BUTT_CAP, pathops.LineJoin.MITER_JOIN,
                                float(style.get('stroke-miterlimit', 4)))
                paint(expanded.transform(*matrix), stroke)
        for child in node:
            walk(child, style, matrix)

    walk(root, {}, Transform())
    return result, [float(n) for n in root.get('viewBox').split()], tiles


def rectangle(x, y, w, h):
    p = pathops.Path()
    parse_path(f'M{x} {y}h{w}v{h}h{-w}Z', p.getPen())
    return p


def entry(number, shape, source_box, suffix=''):
    x, y, source_width, source_height = source_box
    square = abs(source_width-source_height) < 1
    width, height = 85, 85 if square else 147
    scale = min((width-2)/source_width, (height-2)/source_height)
    tx = (width-source_width*scale)/2-x*scale
    ty = (height-source_height*scale)/2-y*scale
    fitted = shape.transform(scale, 0, 0, scale, tx, ty)
    pen = SVGPathPen(None, ntos=lambda value: format(value, '.5f').rstrip('0').rstrip('.') if value else '0')
    fitted.draw(pen)
    d = pen.getCommands()
    bounds = list(fitted.bounds)
    assert bounds[0] >= .999 and bounds[1] >= .999
    assert bounds[2] <= width-.999 and bounds[3] <= height-.999
    name = NAMES.get(number)
    if suffix:
        name = ['Tile cartouche', 'Tile scroll', 'Tile U', 'Tile wordmark'][int(suffix)-1]
    return dict(id=f'asset-{number}'+(f'-{suffix}' if suffix else ''),
                number=f'{number}'+(f'.{suffix}' if suffix else ''),
                name=name, format='square' if square else 'mfs749',
                width=width, height=height, path=d, bounds=bounds,
                source=f'Asset {number}.svg')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    destination = ROOT/'public/shortlist'
    originals = destination/'originals'
    originals.mkdir(parents=True, exist_ok=True)
    entries = []
    for number in NUMBERS:
        source = args.source/f'Asset {number}.svg'
        shape, viewbox, tiles = read_artwork(source)
        shape = pathops.op(shape, rectangle(*viewbox), pathops.PathOp.INTERSECTION)
        shutil.copy2(source, originals/source.name)
        if number == 11:
            assert len(tiles) == 4, tiles
            tiles.sort(key=lambda b: (round(b[1]/100), b[0]))
            for i, (x0, y0, x1, y1) in enumerate(tiles, 1):
                tile = pathops.op(shape, rectangle(x0, y0, x1-x0, y1-y0), pathops.PathOp.INTERSECTION)
                entries.append(entry(number, tile, [x0,y0,x1-x0,y1-y0], str(i)))
        else:
            entries.append(entry(number, shape, viewbox))
    for item in entries:
        item['thumbnail'] = f'{item["id"]}.svg'
        item['sourceHash'] = hashlib.sha256((originals/item['source']).read_bytes()).hexdigest()
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{item["width"]}mm" '
               f'height="{item["height"]}mm" viewBox="0 0 {item["width"]} {item["height"]}">'
               f'<title>{item["number"]} · {item["name"]}</title>'
               f'<path fill="#292c27" d="{item["path"]}"/></svg>')
        (destination/item['thumbnail']).write_text(svg)
    (destination/'manifest.json').write_text(json.dumps(entries, separators=(',', ':')))
    print(f'Built {len(entries)} placed presets, including {sum(e["format"]=="square" for e in entries)} square designs.')


if __name__ == '__main__':
    main()
