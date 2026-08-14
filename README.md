# BYOBS

Bring Your Own Basic Server or Bring Your Own Barebones Server. A minimal BYOS implementation for TRMNL with no fancy widgets, WYSIWYG dashboards, or other bloat -- just name a URL, and BYOBS will serve a screenshot of the page to your device!

Useful for if you already have a webpage you just want to display, or if you (like me!) prefer to make your own dashboard with HTML/CSS for more granular control. Can also be used as a starter for more complex use cases.

## Requirements

Requires Node v26+.

## Installation

TODO

### Sample `.env` File

```
# .env file

PORT = 8081
DOMAIN = <Your Domain or IP address>
```

## Usage

TODO

### Device Settings

| Setting | Value |
| --- | --- |
| ID | The device's ID. In TRMNL devices, this would be the MAC address. |
| Name | A human-readable name for the device (Optional) |
| Width | The device resolution's width |
| Height | The device resolution's height |
| Prefer BMP? | Whether to send back a BMP image instead of a PNG |
| Grayscale Bits | Number of bits of grayscale that the device can display |
| Color Bits | Number of bits of color that the device can display. For BW screens, this is 0 |
| URL | The URL of the page you would like the device to display |
| API Key (hidden) | Generated per device, and used by BYOBS as the screenshot's filename |

Custom BYOD devices can also pass all values as query parameters.

The generated images will be stored at `renders/<device API key>.png` or `renders/<device API key>.bmp`, so you can always look there to see what your device is currently (or should currently) be displaying.

## Technical Details

Why is this in Node.js? Because it was originally part of a separate project (which was in Node) before I decided to separate this out into its own thing.

## License

ISC, with the caveat that you do not use my code for purposes that are explicitly harmful to other humans (including harrassment, hate speech, etc). I'd also love to hear from you if you found anything I made useful!