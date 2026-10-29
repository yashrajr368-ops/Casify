import os
import math
from PIL import Image, ImageDraw, ImageFont

# Destination directories
PUBLIC_DIR = r"E:\LEGAL_AI\casify\frontend\public\logo"
ASSETS_DIR = r"E:\LEGAL_AI\casify\frontend\src\assets\logo"
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

FONT_PATH = r"C:\Windows\Fonts\segoeuib.ttf"
if not os.path.exists(FONT_PATH):
    FONT_PATH = r"C:\Windows\Fonts\arialbd.ttf"

def draw_retech_icon(size=512, mode='color', bg_type='navy'):
    """
    Renders the ReTech AI geometric 'R' neural/circuit icon at high resolution.
    mode: 'color' | 'mono_black' | 'mono_white'
    bg_type: 'navy' | 'transparent' | 'light'
    """
    scale = 4
    canvas_size = size * scale
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Coordinates normalized to 100x100
    def P(x, y):
        return (x / 100.0 * canvas_size, y / 100.0 * canvas_size)

    # 1. Background
    if bg_type == 'navy':
        corner = 26 / 100.0 * canvas_size
        draw.rounded_rectangle(
            [0, 0, canvas_size, canvas_size],
            radius=int(corner),
            fill=(11, 16, 32, 255),
            outline=(59, 130, 246, 70),
            width=int(2 * scale)
        )
    elif bg_type == 'light':
        corner = 26 / 100.0 * canvas_size
        draw.rounded_rectangle(
            [0, 0, canvas_size, canvas_size],
            radius=int(corner),
            fill=(248, 250, 252, 255),
            outline=(226, 232, 240, 255),
            width=int(2 * scale)
        )

    # Color definitions
    if mode == 'color':
        c_blue = (59, 130, 246, 255)    # #3B82F6
        c_cyan = (6, 182, 212, 255)     # #06B6D4
        c_core = (6, 182, 212, 255)
        c_white = (255, 255, 255, 255)
        c_dark_fill = (11, 16, 32, 255) if bg_type != 'light' else (255, 255, 255, 255)
    elif mode == 'mono_black':
        c_blue = (0, 0, 0, 255)
        c_cyan = (0, 0, 0, 255)
        c_core = (0, 0, 0, 255)
        c_white = (0, 0, 0, 255)
        c_dark_fill = (255, 255, 255, 255)
    else: # mono_white
        c_blue = (255, 255, 255, 255)
        c_cyan = (255, 255, 255, 255)
        c_core = (255, 255, 255, 255)
        c_white = (255, 255, 255, 255)
        c_dark_fill = (11, 16, 32, 255)

    # 2. AI Circuit Sub-Trace
    p1 = P(53, 50)
    p2 = P(63, 60)
    p3 = P(73, 60)
    trace_w = int(2.5 * scale)
    draw.line([p1, p2, p3], fill=c_cyan, width=trace_w, joint="curve")
    r_node = 3 * scale
    draw.ellipse([p3[0]-r_node, p3[1]-r_node, p3[0]+r_node, p3[1]+r_node], fill=c_cyan)

    # 3. Main Backbone Spine (Left vertical)
    spine_x1, spine_y1 = P(21, 18)
    spine_x2, spine_y2 = P(31, 82)
    spine_r = int(5 * scale)
    draw.rounded_rectangle([spine_x1, spine_y1, spine_x2, spine_y2], radius=spine_r, fill=c_blue)

    # 4. Neural Connection Bus inside counter
    bus_y = 36 / 100.0 * canvas_size
    bus_x1 = 31 / 100.0 * canvas_size
    bus_x2 = 43 / 100.0 * canvas_size
    # Dashed line
    dash_len = int(3 * scale)
    gap_len = int(2 * scale)
    cur_x = bus_x1
    while cur_x < bus_x2:
        next_x = min(cur_x + dash_len, bus_x2)
        draw.line([(cur_x, bus_y), (next_x, bus_y)], fill=c_cyan, width=int(2.5 * scale))
        cur_x += dash_len + gap_len

    # Center AI node
    core_cx, core_cy = P(45, 36)
    core_r = 4 * scale
    draw.ellipse([core_cx-core_r, core_cy-core_r, core_cx+core_r, core_cy+core_r], fill=c_core)
    core_inner = 1.75 * scale
    draw.ellipse([core_cx-core_inner, core_cy-core_inner, core_cx+core_inner, core_cy+core_inner], fill=c_white)

    # 5. Upper Neural Loop
    # We draw thick line using arc approximation or multi-segments
    stroke_w = int(10 * scale)
    loop_top_left = P(26, 23)
    loop_top_right = P(51, 23)
    draw.line([loop_top_left, loop_top_right], fill=c_blue, width=stroke_w)

    loop_bot_left = P(26, 51)
    loop_bot_right = P(51, 51)
    draw.line([loop_bot_left, loop_bot_right], fill=c_cyan, width=stroke_w)

    # Arc connecting top_right to bot_right
    arc_box = [P(33, 23)[0] - stroke_w//2, P(33, 23)[1] - stroke_w//2,
               P(69, 51)[0] + stroke_w//2, P(69, 51)[1] + stroke_w//2]
    # Arc bounding box center: x between 33 and 69
    arc_cx = 51 / 100.0 * canvas_size
    arc_r = 14 / 100.0 * canvas_size
    draw.arc([arc_cx - arc_r - stroke_w/2, 23/100.0*canvas_size - stroke_w/2,
              arc_cx + arc_r + stroke_w/2, 51/100.0*canvas_size + stroke_w/2],
             start=-90, end=90, fill=c_cyan, width=stroke_w)

    # End caps for smooth joins
    cap_r = stroke_w // 2
    draw.ellipse([loop_top_left[0]-cap_r, loop_top_left[1]-cap_r, loop_top_left[0]+cap_r, loop_top_left[1]+cap_r], fill=c_blue)
    draw.ellipse([loop_bot_left[0]-cap_r, loop_bot_left[1]-cap_r, loop_bot_left[0]+cap_r, loop_bot_left[1]+cap_r], fill=c_cyan)

    # Apex Neural Junction
    apex_x, apex_y = P(69, 37)
    ap_out = 6 * scale
    draw.ellipse([apex_x-ap_out, apex_y-ap_out, apex_x+ap_out, apex_y+ap_out], fill=c_dark_fill, outline=c_cyan, width=int(2*scale))
    ap_in = 3 * scale
    draw.ellipse([apex_x-ap_in, apex_y-ap_in, apex_x+ap_in, apex_y+ap_in], fill=c_blue)

    # 6. Dynamic Forward Leg
    leg_start = P(42, 51)
    leg_end = P(70, 79)
    draw.line([leg_start, leg_end], fill=c_cyan, width=stroke_w)
    draw.ellipse([leg_start[0]-cap_r, leg_start[1]-cap_r, leg_start[0]+cap_r, leg_start[1]+cap_r], fill=c_cyan)

    # Terminal Circuit Pad
    term_x, term_y = P(70, 79)
    term_out = 6 * scale
    draw.ellipse([term_x-term_out, term_y-term_out, term_x+term_out, term_y+term_out], fill=c_dark_fill, outline=c_cyan, width=int(2*scale))
    term_in = 2.5 * scale
    draw.ellipse([term_x-term_in, term_y-term_in, term_x+term_in, term_y+term_in], fill=c_white)

    # Downsample with Lanczos for anti-aliasing
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def draw_retech_full_logo(width=800, height=200, mode='color', bg_type='navy'):
    """
    Renders the full ReTech AI Logo with Wordmark.
    """
    scale = 3
    cw = width * scale
    ch = height * scale
    img = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background
    if bg_type == 'navy':
        draw.rounded_rectangle([0, 0, cw, ch], radius=int(24 * scale), fill=(11, 16, 32, 255))
    elif bg_type == 'light':
        draw.rounded_rectangle([0, 0, cw, ch], radius=int(24 * scale), fill=(255, 255, 255, 255))

    # Render Icon on the left
    icon_size = int(140 * scale)
    icon_img = draw_retech_icon(size=icon_size, mode=mode, bg_type=bg_type if bg_type != 'light' else 'transparent')
    icon_x = int(30 * scale)
    icon_y = int((ch - icon_size) // 2)
    img.alpha_composite(icon_img, (icon_x, icon_y))

    # Typography
    text_x = icon_x + icon_size + int(32 * scale)
    font_size_main = int(72 * scale)
    font_main = ImageFont.truetype(FONT_PATH, font_size_main)

    font_size_ai = int(32 * scale)
    font_ai = ImageFont.truetype(FONT_PATH, font_size_ai)

    if mode == 'color':
        text_color = (255, 255, 255, 255) if bg_type != 'light' else (15, 23, 42, 255)
        ai_color = (6, 182, 212, 255)
        badge_bg = (6, 182, 212, 35) if bg_type != 'light' else (224, 242, 254, 255)
        badge_border = (6, 182, 212, 120) if bg_type != 'light' else (2, 132, 199, 100)
    elif mode == 'mono_black':
        text_color = (0, 0, 0, 255)
        ai_color = (0, 0, 0, 255)
        badge_bg = (241, 245, 249, 255)
        badge_border = (0, 0, 0, 255)
    else: # mono_white
        text_color = (255, 255, 255, 255)
        ai_color = (255, 255, 255, 255)
        badge_bg = (30, 41, 59, 255)
        badge_border = (255, 255, 255, 255)

    # Draw "ReTech"
    text_y = int((ch - font_size_main) // 2) - int(6 * scale)
    draw.text((text_x, text_y), "ReTech", font=font_main, fill=text_color)

    # Measure width of "ReTech"
    bbox = font_main.getbbox("ReTech")
    retech_width = bbox[2] - bbox[0]

    # Draw "AI" Badge
    badge_x = text_x + retech_width + int(24 * scale)
    badge_w = int(96 * scale)
    badge_h = int(52 * scale)
    badge_y = text_y + (font_size_main - badge_h) // 2 + int(4 * scale)

    draw.rounded_rectangle(
        [badge_x, badge_y, badge_x + badge_w, badge_y + badge_h],
        radius=int(12 * scale),
        fill=badge_bg,
        outline=badge_border,
        width=int(2 * scale)
    )

    # Center "AI" in badge
    ai_bbox = font_ai.getbbox("AI")
    ai_w = ai_bbox[2] - ai_bbox[0]
    ai_h = ai_bbox[3] - ai_bbox[1]
    ai_tx = badge_x + (badge_w - ai_w) // 2
    ai_ty = badge_y + (badge_h - ai_h) // 2 - int(2 * scale)
    draw.text((ai_tx, ai_ty), "AI", font=font_ai, fill=ai_color)

    final_img = img.resize((width, height), Image.Resampling.LANCZOS)
    return final_img

# Generate all required PNG files
print("Generating ReTech AI PNG deliverables...")

# 1. Primary Logo PNG (Dark & Light)
draw_retech_full_logo(width=640, height=160, mode='color', bg_type='navy').save(os.path.join(PUBLIC_DIR, "retech-ai-logo.png"))
draw_retech_full_logo(width=640, height=160, mode='color', bg_type='light').save(os.path.join(PUBLIC_DIR, "retech-ai-logo-light.png"))
draw_retech_full_logo(width=640, height=160, mode='color', bg_type='transparent').save(os.path.join(PUBLIC_DIR, "retech-ai-logo-transparent.png"))

# Copy to assets
draw_retech_full_logo(width=640, height=160, mode='color', bg_type='navy').save(os.path.join(ASSETS_DIR, "retech-ai-logo.png"))
draw_retech_full_logo(width=640, height=160, mode='color', bg_type='light').save(os.path.join(ASSETS_DIR, "retech-ai-logo-light.png"))

# 2. Icon-only PNG (512x512 app icon & transparent)
draw_retech_icon(size=512, mode='color', bg_type='navy').save(os.path.join(PUBLIC_DIR, "retech-ai-icon.png"))
draw_retech_icon(size=512, mode='color', bg_type='transparent').save(os.path.join(PUBLIC_DIR, "retech-ai-icon-transparent.png"))
draw_retech_icon(size=512, mode='color', bg_type='navy').save(os.path.join(ASSETS_DIR, "retech-ai-icon.png"))

# 3. Monochrome PNGs
draw_retech_full_logo(width=640, height=160, mode='mono_black', bg_type='transparent').save(os.path.join(PUBLIC_DIR, "retech-ai-monochrome.png"))
draw_retech_full_logo(width=640, height=160, mode='mono_white', bg_type='transparent').save(os.path.join(PUBLIC_DIR, "retech-ai-monochrome-white.png"))
draw_retech_full_logo(width=640, height=160, mode='mono_black', bg_type='transparent').save(os.path.join(ASSETS_DIR, "retech-ai-monochrome.png"))

# 4. Favicon PNG (64x64 & 32x32)
draw_retech_icon(size=64, mode='color', bg_type='navy').save(os.path.join(PUBLIC_DIR, "favicon.png"))
draw_retech_icon(size=32, mode='color', bg_type='navy').save(os.path.join(PUBLIC_DIR, "favicon-32x32.png"))

print("All PNG assets successfully generated!")
