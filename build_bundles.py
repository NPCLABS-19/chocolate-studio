from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root=Path(__file__).resolve().parent
terrain=root/'public/terrain-graphics'
final_graphics=['01-tidal-basin-opaque.png','02-sea-cave-opaque.png','03-skylight.png','04-reflection-pool-opaque.png','05-eroded-channels.png']
with ZipFile(terrain/'azura-terrain-graphics.zip','w',ZIP_DEFLATED) as archive:
    for name in final_graphics+['prompts.json']:
        archive.write(terrain/name,name)
library=root/'public/library'
with ZipFile(library/'azura-frame-library.zip','w',ZIP_DEFLATED) as archive:
    for path in sorted(library.rglob('*')):
        if path.is_file() and path.suffix!='.zip':archive.write(path,path.relative_to(library))
print('Created final terrain and frame-library bundles.')
