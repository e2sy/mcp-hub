#!/usr/bin/env python3
"""
Generates terminal-style PNG screenshots from CLI text output.
Creates images that look like a real terminal window.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

# Terminal colors
BG_COLOR = (13, 14, 18)  # #0d0e12
TEXT_COLOR = (230, 232, 240)  # light gray
GREEN = (52, 211, 153)  # emerald
RED = (248, 113, 113)
YELLOW = (251, 191, 36)
CYAN = (103, 232, 249)
GRAY = (148, 156, 176)
TITLE_BG = (22, 24, 30)

# macOS traffic light colors
TL_RED = (255, 95, 86)
TL_YELLOW = (255, 189, 46)
TL_GREEN = (39, 201, 63)

def get_font(size=14):
    """Get a monospace font."""
    font_paths = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf',
        '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf',
    ]
    for path in font_paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def render_screenshot(input_file, output_file, title='mcp-hub', max_lines=40):
    """Render a text file as a terminal screenshot."""
    with open(input_file, 'r') as f:
        lines = f.readlines()

    # Limit lines
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        lines.append('... (truncated)\n')

    # Strip ANSI codes for rendering (simplified)
    import re
    clean_lines = []
    for line in lines:
        # Remove ANSI escape codes
        clean = re.sub(r'\x1b\[[0-9;]*m', '', line.rstrip('\n'))
        clean_lines.append(clean)

    # Calculate dimensions
    font = get_font(15)
    line_height = 22
    padding = 20
    title_bar_height = 40
    
    max_line_width = 0
    for line in clean_lines:
        bbox = font.getbbox(line)
        width = bbox[2] - bbox[0]
        if width > max_line_width:
            max_line_width = width

    img_width = max(max_line_width + padding * 2, 600)
    img_height = title_bar_height + len(clean_lines) * line_height + padding

    # Create image
    img = Image.new('RGB', (img_width, img_height), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Draw title bar
    draw.rectangle([0, 0, img_width, title_bar_height], fill=TITLE_BG)
    
    # Traffic lights
    tl_y = title_bar_height // 2 - 8
    draw.ellipse([15, tl_y, 29, tl_y + 14], fill=TL_RED)
    draw.ellipse([37, tl_y, 51, tl_y + 14], fill=TL_YELLOW)
    draw.ellipse([59, tl_y, 73, tl_y + 14], fill=TL_GREEN)

    # Title text
    title_font = get_font(13)
    title_bbox = title_font.getbbox(title)
    title_w = title_bbox[2] - title_bbox[0]
    draw.text((img_width // 2 - title_w // 2, 12), title, fill=GRAY, font=title_font)

    # Draw content
    y = title_bar_height + padding - 5
    for line in clean_lines:
        # Color detection
        color = TEXT_COLOR
        stripped = line.strip()
        
        if stripped.startswith('✓') or stripped.startswith('✔'):
            color = GREEN
        elif stripped.startswith('✗') or stripped.startswith('✘'):
            color = RED
        elif stripped.startswith('⚠'):
            color = YELLOW
        elif stripped.startswith('◆') or stripped.startswith('→'):
            color = CYAN
        elif stripped.startswith('─') or stripped.startswith('═'):
            color = GRAY
        elif stripped.startswith('╔') or stripped.startswith('║') or stripped.startswith('╚'):
            color = CYAN
        elif stripped.startswith('★'):
            color = YELLOW
        elif stripped.startswith('•') or stripped.startswith('○'):
            color = GRAY
        elif 'not found' in stripped.lower() or 'failed' in stripped.lower():
            color = RED
        elif 'ok' in stripped.lower() and len(stripped) < 30:
            color = GREEN

        draw.text((padding, y), line, fill=color, font=font)
        y += line_height

    # Save
    img.save(output_file, 'PNG')
    print(f'  ✓ {output_file} ({img_width}x{img_height})')

def main():
    screenshots = [
        ('/tmp/cli-help.txt', '.github/assets/screenshots/help.png', 'mcp-hub --help'),
        ('/tmp/cli-list.txt', '.github/assets/screenshots/list.png', 'mcp-hub list'),
        ('/tmp/cli-status.txt', '.github/assets/screenshots/status.png', 'mcp-hub status'),
        ('/tmp/cli-doctor.txt', '.github/assets/screenshots/doctor.png', 'mcp-hub doctor'),
        ('/tmp/cli-history.txt', '.github/assets/screenshots/history.png', 'mcp-hub history'),
        ('/tmp/cli-categories.txt', '.github/assets/screenshots/categories.png', 'mcp-hub categories'),
    ]

    print('Generating screenshots...\n')
    for input_file, output_file, title in screenshots:
        if os.path.exists(input_file):
            render_screenshot(input_file, output_file, title)
        else:
            print(f'  ✗ {input_file} not found')

    print('\nDone!')

if __name__ == '__main__':
    main()
