"""Dump a subtree of the saved Figma metadata: python3 scripts/figdump.py <nodeId> [maxDepth]"""
import sys, xml.etree.ElementTree as ET
s = open('docs/figma-specs/metadata-all-frames.xml').read()
s = s[s.find('<'):s.rfind('</canvas>') + 9]
root = ET.fromstring(s)
target = sys.argv[1]; maxd = int(sys.argv[2]) if len(sys.argv) > 2 else 99
node = next(n for n in root.iter() if n.attrib.get('id') == target)
SKIP = {'Container', 'Background', 'Icon'}
def r(v): return str(round(float(v), 1)).rstrip('0').rstrip('.')
def walk(n, d, ox, oy):
    a = n.attrib
    x, y = ox + float(a.get('x', 0)), oy + float(a.get('y', 0))
    name = a.get('name', '')
    if d <= maxd:
        kids = list(n)
        if not (name in SKIP and n.tag == 'frame' and len(kids) == 1):
            print('  ' * d + f"{n.tag[0]} {name[:70]} [{r(x)},{r(y)} {r(a.get('width',0))}x{r(a.get('height',0))}] {a.get('id')}")
        for c in kids: walk(c, d + 1, x, y)
walk(node, 0, -float(node.attrib.get('x', 0)), -float(node.attrib.get('y', 0)))
