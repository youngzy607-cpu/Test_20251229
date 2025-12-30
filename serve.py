import http.server
import socketserver
import socket
import webbrowser

PORT = 8080

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

Handler = http.server.SimpleHTTPRequestHandler
ip = get_ip()
url = f"http://{ip}:{PORT}/host.html"

print(f"-"*40)
print(f"Kelly Pool Server Started!")
print(f"Local URL: http://localhost:{PORT}/host.html")
print(f"Network URL: {url}")
print(f"-"*40)
print(f"Please open {url} in your browser to start the game.")
print(f"Keep this window open while playing.")

# Try to open automatically
try:
    webbrowser.open(url)
except:
    pass

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
