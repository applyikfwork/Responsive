# **App Name**: ViewPortly

## Core Features:

- URL Input: Accept a URL from the user to preview in different viewport sizes.
- Device Preview: Display the website within iframes, simulating different device resolutions (mobile, tablet, desktop).
- Custom Dimensions: Allow users to input custom width and height values to preview the website at specific resolutions.
- Add New Frame: A user can add a new frame into the app using custom resolution
- Intelligent error reporting: The tool will try to detect when a website refuses to load in an iframe due to security restrictions, and report it in plain language. A tool can make this decision based on details available to the browser regarding the iframe contents.

## Style Guidelines:

- Primary color: Soft blue (#64B5F6) to create a calm and reliable feel.
- Background color: Very light blue (#F0F8FF) to maintain a clean and unobtrusive aesthetic.
- Accent color: Muted purple (#9575CD) to provide subtle contrast for buttons and highlights.
- Body and headline font: 'Inter' (sans-serif) for a clean, modern, and readable interface. Note: currently only Google Fonts are supported.
- Use simple, outlined icons to represent devices (mobile, tablet, desktop) and actions (refresh, add custom size).
- Arrange device previews in a responsive grid layout. The URL input field should remain prominent at the top.
- Use subtle transitions when loading websites into the iframes, and when custom sizes are added.