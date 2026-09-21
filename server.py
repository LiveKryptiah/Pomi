#!/usr/bin/env python3
"""
MyPet Local Development Server
Provides static file serving with fallback to index.html for SPA routes.
"""

import http.server
import socketserver
import os
import sys

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyPetHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Resolve physical path
        requested_path = self.translate_path(self.path)
        
        # If file exists, serve it normally
        if os.path.exists(requested_path) and not os.path.isdir(requested_path):
            return super().do_GET()
        
        # If index.html requested or root
        if self.path in ('/', '/index.html'):
            return super().do_GET()
            
        # Fallback for SPA routing (/p/..., /dashboard, etc.)
        self.path = '/index.html'
        return super().do_GET()

def run_server(port=PORT):
    handler = MyPetHandler
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print("==================================================")
            print("[MyPet] Digital Pet ID & QR Recovery Web App")
            print(f"-> Local URL:   http://localhost:{port}")
            print(f"-> Demo Scan:   http://localhost:{port}/#p/luna-7x29")
            print(f"-> Dashboard:   http://localhost:{port}/#dashboard")
            print("==================================================")
            print("Press Ctrl+C to stop the server.")
            httpd.serve_forever()
    except OSError as e:
        if "address already in use" in str(e).lower() or getattr(e, 'errno', 0) in (48, 98, 10048):
            print(f"Port {port} in use, trying {port + 1}...")
            run_server(port + 1)
        else:
            raise e

if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port_arg)
