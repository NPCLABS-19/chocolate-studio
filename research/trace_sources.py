"""Convert source contour scans to editable SVG paths; keep photo interpretation explicit.

This is vector extraction, not an AI redraw. Raw-source traces preserve the selected
visible pixel contours. They are not manufacturing-approved relief geometry.
"""
import json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/library/traces'
OUT.mkdir(parents=True, exist_ok=True)
specs=[
 ('T01','Scroll panel','P15',None,'line',230),
 ('T02','Twin heart doors','P18',(16,120,429,492),'white',125),
 ('T03','Penang oval grille','P13',(91,121,425,499),'white',115),
 ('T04','Palmette drawing','P19',(65,345,392,571),'line',135),
 ('T05','Red scroll gate','P01',(66,45,415,443),'red',0),
 ('T06','Crowned iron gate','P22',(46,42,345,434),'light',65),
 ('T07','Catalogue scroll vine','P03',(35,69,112,306),'line',135),
 ('T08','Catalogue S vine','P03',(350,363,447,603),'line',135),
]
manifest=[]
for ident,name,source,box,mode,threshold in specs:
    img=Image.open(ROOT/f'research/source-scans/{source}.jpg').convert('RGB')
    if box:img=img.crop(box)
    a=np.asarray(img).astype(np.int16);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
    gray=(.299*r+.587*g+.114*b)
    if mode=='red':mask=((r-g>20)&(r-b>18)&(r>65)).astype('uint8')*255
    elif mode=='white':mask=((gray>threshold)&(a.max(2)-a.min(2)<70)).astype('uint8')*255
    elif mode=='light':mask=(gray>threshold).astype('uint8')*255
    else:mask=(gray<threshold).astype('uint8')*255
    # Close subpixel scan gaps, while keeping voids and the actual source contours.
    mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3)))
    count,labels,stats,_=cv2.connectedComponentsWithStats(mask,8)
    cleaned=np.zeros_like(mask)
    for i in range(1,count):
        if stats[i,cv2.CC_STAT_AREA]>=9:cleaned[labels==i]=255
    contours,hierarchy=cv2.findContours(cleaned,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
    paths=[]
    for contour in contours:
        if abs(cv2.contourArea(contour))<6:continue
        pts=cv2.approxPolyDP(contour,.45,True).reshape(-1,2)
        if len(pts)<3:continue
        paths.append('M'+'L'.join(f'{int(x)},{int(y)}' for x,y in pts)+'Z')
    w,h=img.size;d=' '.join(paths)
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="60mm" height="120mm" viewBox="0 0 {w} {h}"><title>{ident} {name} — source contour trace</title><desc>Source {source}. Pixel contour extraction with 0.45 px simplification. PreserveAspectRatio meet: source proportions retained. Not manufacturing CAD.</desc><path fill="black" fill-rule="evenodd" d="{d}"/></svg>'
    (OUT/f'{ident}-source.svg').write_text(svg)
    # A separate broadened outline keeps the source's actual gestures. Raw traces
    # remain intact; opening/closing tiny channels is explicit in the adaptation.
    broad=cv2.dilate(cleaned,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5)),iterations=1)
    broad_contours,_=cv2.findContours(broad,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
    broad_paths=[]
    for contour in broad_contours:
        if abs(cv2.contourArea(contour))<12:continue
        pts=cv2.approxPolyDP(contour,.85,True).reshape(-1,2)
        if len(pts)>=3:
            corners=[]
            for i,p in enumerate(pts.astype(float)):
                prev=pts[(i-1)%len(pts)].astype(float);nxt=pts[(i+1)%len(pts)].astype(float)
                a=p-prev;b=nxt-p;la=np.linalg.norm(a);lb=np.linalg.norm(b)
                radius=min(1.2,la/3,lb/3)
                corners.append((p-a/max(la,.001)*radius,p,p+b/max(lb,.001)*radius))
            start=corners[-1][2];q=f'M{start[0]:.2f},{start[1]:.2f}'
            for before,p,after in corners:
                q+=f'L{before[0]:.2f},{before[1]:.2f}Q{p[0]:.2f},{p[1]:.2f} {after[0]:.2f},{after[1]:.2f}'
            broad_paths.append(q+'Z')
    broad_d=' '.join(broad_paths)
    broad_svg=svg.replace(d,broad_d).replace('source contour trace','broadened source relief').replace('Pixel contour extraction with 0.45 px simplification.','Source contour expanded by a 5 px ellipse and simplified by 0.6 px. Fine channels may close.')
    (OUT/f'{ident}-relief.svg').write_text(broad_svg)
    item={'id':ident,'name':name,'source':source,'width':w,'height':h,'path':d,'reliefPath':broad_d,'type':'source contour trace','pixelTolerance':.45,'crop':box,'segmentation':mode}
    manifest.append(item)
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps([{'id':e['id'],'source':e['source'],'commands':e['path'].count('L')} for e in manifest]))
