from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path("assets/tank-preview.png")
W, H = 1200, 675
image = Image.new("RGB", (W, H), "#0b100d")
draw = ImageDraw.Draw(image)

font_path = Path(r"C:\Windows\Fonts\msyh.ttc")
font_bold_path = Path(r"C:\Windows\Fonts\msyhbd.ttc")

def font(size, bold=False):
    path = font_bold_path if bold and font_bold_path.exists() else font_path
    return ImageFont.truetype(str(path), size) if path.exists() else ImageFont.load_default()

# HUD
draw.rectangle((0, 0, W, 76), fill="#111713")
draw.line((0, 75, W, 75), fill="#34433b", width=2)
draw.rectangle((34, 20, 96, 56), fill="#f0cc61")
draw.text((65, 38), "ZZC", anchor="mm", font=font(15, True), fill="#101712")
draw.text((116, 23), "华园保卫战", font=font(24, True), fill="#edf5f0")
draw.text((116, 50), "TANK DEFENSE", font=font(11, True), fill="#9fafaa")

stats = [("得分", "0860"), ("波次", "2 / 2"), ("敌军", "06"), ("装甲", "3")]
for index, (label, value) in enumerate(stats):
    x = 650 + index * 128
    draw.text((x, 24), label, font=font(12, True), fill="#9fafaa")
    draw.text((x, 44), value, font=font(22, True), fill="#f0cc61")

# Battlefield with campus roads and buildings.
field = (22, 96, W - 22, H - 24)
draw.rectangle(field, fill="#17342a", outline="#4a5c53", width=2)
draw.rectangle((40, 120, 210, 180), fill="#254b3d", outline="#668675", width=2)
draw.rectangle((990, 120, 1160, 180), fill="#254b3d", outline="#668675", width=2)
for y in (138, 156):
    draw.rectangle((55, y, 195, y + 7), fill="#6f7450")
    draw.rectangle((1005, y, 1145, y + 7), fill="#6f7450")
draw.rectangle((22, 188, W - 22, 224), fill="#2f4d42")
draw.rectangle((22, 525, W - 22, 561), fill="#2f4d42")
for x in range(40, W, 48):
    draw.line((x, 97, x, H - 24), fill="#203f33", width=1)
for y in range(112, H, 48):
    draw.line((22, y, W - 22, y), fill="#203f33", width=1)

# ZZC brick layout mirrors the actual game map.
patterns = {
    "Z": ["11111", "00010", "00100", "01000", "11111"],
    "C": ["11111", "10000", "10000", "10000", "11111"],
}
tile = 24
gap = 50
start_x = 360
start_y = 285
for letter_index, letter in enumerate(("Z", "Z", "C")):
    for row_index, row in enumerate(patterns[letter]):
        for column_index, value in enumerate(row):
            if value != "1":
                continue
            x = start_x + letter_index * (tile * 5 + gap) + column_index * tile
            y = start_y + row_index * tile
            draw.rectangle((x + 1, y + 1, x + tile - 2, y + tile - 2), fill="#a85438", outline="#6d2e20")
            draw.line((x + 2, y + 6, x + tile - 3, y + 6), fill="#d07850", width=2)

def tank(cx, cy, color, angle="up"):
    if angle in ("left", "right"):
        draw.rectangle((cx - 25, cy - 18, cx + 25, cy + 18), fill="#171d19")
        draw.rectangle((cx - 19, cy - 13, cx + 19, cy + 13), fill=color)
        barrel = (cx - 38, cy - 3, cx - 10, cy + 3) if angle == "left" else (cx + 10, cy - 3, cx + 38, cy + 3)
    else:
        draw.rectangle((cx - 18, cy - 25, cx + 18, cy + 25), fill="#171d19")
        draw.rectangle((cx - 13, cy - 19, cx + 13, cy + 19), fill=color)
        barrel = (cx - 3, cy - 38, cx + 3, cy - 10) if angle == "up" else (cx - 3, cy + 10, cx + 3, cy + 38)
    draw.rectangle(barrel, fill="#202822")
    draw.ellipse((cx - 7, cy - 7, cx + 7, cy + 7), fill="#202822", outline=color, width=3)

tank(600, 500, "#69d0a8", "up")
tank(158, 258, "#f06757", "right")
tank(1038, 270, "#f0cc61", "left")
tank(842, 470, "#f06757", "left")

# Base and shell trails.
draw.rectangle((563, 570, 637, 627), fill="#e6d7a4")
draw.polygon(((554, 582), (600, 552), (646, 582)), fill="#f0cc61")
draw.rectangle((589, 595, 611, 627), fill="#17342a")
for x, y, color in ((600, 454, "#fff2a8"), (238, 258, "#ff8a7d"), (934, 470, "#ff8a7d")):
    draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=color)

draw.text((48, H - 52), "ORIGINAL CAMPUS MAP · NAME MARK: ZZC", font=font(14, True), fill="#f0cc61")

image.save(OUT, "PNG", optimize=True)
print(f"created {OUT} ({OUT.stat().st_size} bytes)")
