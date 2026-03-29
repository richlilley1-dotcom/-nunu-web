import os, sys
os.chdir("/Users/richardlilley/Desktop/nunu Web")
from http.server import HTTPServer, SimpleHTTPRequestHandler
HTTPServer(("127.0.0.1", 8765), SimpleHTTPRequestHandler).serve_forever()
