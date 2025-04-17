
import os
import json
import http.server
import socketserver
import urllib.parse
from http import HTTPStatus
from datetime import datetime
from urllib.parse import parse_qs, urlparse
from decimal import Decimal

# Import modules
from auth import register_user, login_user, login_admin
from artwork import get_all_artworks, get_artwork, create_artwork, update_artwork, delete_artwork
from exhibition import get_all_exhibitions, get_exhibition, create_exhibition, update_exhibition, delete_exhibition
from contact import create_contact_message, get_messages, update_message, json_dumps
from db_setup import initialize_database
from middleware import auth_required, admin_required, extract_auth_token, verify_token

# Import module for file upload handling
import tempfile
import shutil

# Define the port
PORT = 8000

# Create the uploads directory if it doesn't exist
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(UPLOADS_DIR, exist_ok=True)
print(f"Uploads directory: {UPLOADS_DIR}")

# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

class RequestHandler(http.server.BaseHTTPRequestHandler):
    
    def _set_response(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_response()
    
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        # Serve static files
        if path.startswith('/static/'):
            try:
                file_path = os.path.join(os.path.dirname(__file__), path[1:])
                print(f"Serving static file: {file_path}")
                
                # Check if file exists
                if not os.path.exists(file_path):
                    self._set_response(404)
                    self.wfile.write(json_dumps({"error": "File not found"}).encode())
                    return
                
                # Determine content type based on file extension
                content_type = 'application/octet-stream'
                if file_path.endswith('.jpg') or file_path.endswith('.jpeg'):
                    content_type = 'image/jpeg'
                elif file_path.endswith('.png'):
                    content_type = 'image/png'
                elif file_path.endswith('.gif'):
                    content_type = 'image/gif'
                
                # Send file response
                with open(file_path, 'rb') as file:
                    self._set_response(200, content_type)
                    self.wfile.write(file.read())
                return
            except Exception as e:
                print(f"Error serving static file: {e}")
                self._set_response(500)
                self.wfile.write(json_dumps({"error": "Error serving file"}).encode())
                return
        
        # Handle GET /artworks
        elif path == '/artworks':
            response = get_all_artworks()
            self._set_response()
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Handle GET /artworks/{id}
        elif path.startswith('/artworks/') and len(path.split('/')) == 3:
            artwork_id = path.split('/')[2]
            response = get_artwork(artwork_id)
            self._set_response()
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Handle GET /exhibitions
        elif path == '/exhibitions':
            response = get_all_exhibitions()
            self._set_response()
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Handle GET /exhibitions/{id}
        elif path.startswith('/exhibitions/') and len(path.split('/')) == 3:
            exhibition_id = path.split('/')[2]
            response = get_exhibition(exhibition_id)
            self._set_response()
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Handle GET /messages (admin only)
        elif path == '/messages':
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json_dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json_dumps({"error": payload["error"]}).encode())
                return
            
            # Check if user is admin
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json_dumps({"error": "Unauthorized access: Admin privileges required"}).encode())
                return
            
            response = get_messages(self.headers.get('Authorization', ''))
            self._set_response()
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Default 404 response
        self._set_response(404)
        self.wfile.write(json_dumps({"error": "Resource not found"}).encode())
    
    def handle_file_upload(self, form_data, boundary):
        """Handle file upload from multipart/form-data"""
        try:
            # Process form data to extract file and other fields
            file_data = None
            file_name = None
            fields = {}
            
            parts = form_data.split(f'--{boundary}'.encode())
            for part in parts:
                if not part.strip():
                    continue
                
                # Split header and content
                header_end = part.find(b'\r\n\r\n')
                if header_end == -1:
                    continue
                
                header = part[:header_end].decode('utf-8')
                content = part[header_end + 4:].strip()
                
                # Extract content disposition
                content_disposition = None
                for line in header.split('\r\n'):
                    if line.lower().startswith('content-disposition:'):
                        content_disposition = line
                        break
                
                if not content_disposition:
                    continue
                
                # Extract field name and filename
                name_match = re.search(r'name="([^"]+)"', content_disposition)
                filename_match = re.search(r'filename="([^"]+)"', content_disposition)
                
                if name_match:
                    field_name = name_match.group(1)
                    if filename_match:
                        # This is a file field
                        file_name = filename_match.group(1)
                        file_data = content
                    else:
                        # This is a regular field
                        fields[field_name] = content.decode('utf-8')
            
            # If no file uploaded, return error
            if not file_data or not file_name:
                return {"error": "No file uploaded"}, fields
            
            # Generate unique filename
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            file_ext = os.path.splitext(file_name)[1]
            new_filename = f"{timestamp}_artwork{file_ext}"
            save_path = os.path.join(UPLOADS_DIR, new_filename)
            
            # Save file
            with open(save_path, 'wb') as f:
                f.write(file_data)
            
            return {"file_path": f"/static/uploads/{new_filename}"}, fields
        
        except Exception as e:
            print(f"Error handling file upload: {e}")
            return {"error": f"Error handling file upload: {str(e)}"}, {}
    
    def do_POST(self):
        # Get content length
        content_length = int(self.headers.get('Content-Length', 0))
        
        # Get content type
        content_type = self.headers.get('Content-Type', '')
        
        # Debug information
        print(f"POST to {self.path} with content type: {content_type}, length: {content_length}")
        
        # Parse POST data based on content type
        post_data = {}
        
        if content_length > 0:
            if "application/json" in content_type:
                # Handle JSON data
                post_data = json.loads(self.rfile.read(content_length).decode('utf-8'))
                print(f"Parsed JSON data: {post_data}")
            elif "multipart/form-data" in content_type:
                # Process multipart form data
                boundary = content_type.split('boundary=')[1].strip()
                raw_data = self.rfile.read(content_length)
                file_result, form_fields = self.handle_file_upload(raw_data, boundary)
                
                if "error" in file_result:
                    self._set_response(400)
                    self.wfile.write(json_dumps(file_result).encode())
                    return
                
                # Merge file path into form fields
                post_data = form_fields
                post_data['imageUrl'] = file_result['file_path']
            else:
                # Handle plain form data (url-encoded)
                form_data = self.rfile.read(content_length).decode('utf-8')
                post_data = parse_qs(form_data)
                for key in post_data:
                    post_data[key] = post_data[key][0]
                print(f"Parsed form data: {post_data}")
        
        # Process based on path
        path = self.path
        
        # Register user
        if path == '/register':
            if not post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Missing registration data"}).encode())
                return
            
            print(f"Registration data: {post_data}")
            
            # Check required fields
            required_fields = ['name', 'email', 'password']
            missing_fields = [field for field in required_fields if field not in post_data]
            
            if missing_fields:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"}).encode())
                return
            
            # Register the user
            response = register_user(
                post_data['name'], 
                post_data['email'], 
                post_data['password'],
                post_data.get('phone', '')  # Optional field
            )
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json_dumps(response).encode())
            return
        
        # User login
        elif path == '/login':
            if not post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Missing login data"}).encode())
                return
            
            # Check required fields
            if 'email' not in post_data or 'password' not in post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Email and password required"}).encode())
                return
            
            # Login the user
            response = login_user(post_data['email'], post_data['password'])
            
            if "error" in response:
                self._set_response(401)
                self.wfile.write(json_dumps(response).encode())
                return
            
            self._set_response(200)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Admin login - Fixed the endpoint
        elif path == '/admin-login':
            if not post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Missing login data"}).encode())
                return
            
            # Check required fields
            if 'email' not in post_data or 'password' not in post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Email and password required"}).encode())
                return
            
            # Login as admin
            response = login_admin(post_data['email'], post_data['password'])
            
            if "error" in response:
                self._set_response(401)
                self.wfile.write(json_dumps(response).encode())
                return
            
            self._set_response(200)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Create artwork (admin only)
        elif path == '/artworks':
            auth_header = self.headers.get('Authorization', '')
            response = create_artwork(auth_header, post_data)
            
            if "error" in response:
                error_message = response["error"]
                
                if "Authentication" in error_message or "authorized" in error_message:
                    self._set_response(401)
                elif "Admin" in error_message:
                    self._set_response(403)
                else:
                    self._set_response(400)
                    
                self.wfile.write(json_dumps({"error": error_message}).encode())
                return
            
            self._set_response(201)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Create exhibition (admin only)
        elif path == '/exhibitions':
            auth_header = self.headers.get('Authorization', '')
            response = create_exhibition(auth_header, post_data)
            
            if "error" in response:
                error_message = response["error"]
                
                if "Authentication" in error_message or "authorized" in error_message:
                    self._set_response(401)
                elif "Admin" in error_message:
                    self._set_response(403)
                else:
                    self._set_response(400)
                    
                self.wfile.write(json_dumps({"error": error_message}).encode())
                return
            
            self._set_response(201)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Create contact message
        elif path == '/contact':
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            
            # Parse JSON data
            post_data = {}
            if content_length > 0:
                post_data = json.loads(self.rfile.read(content_length).decode('utf-8'))
            
            # Check required fields
            required_fields = ['name', 'email', 'message']
            missing_fields = [field for field in required_fields if field not in post_data]
            
            if missing_fields:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"}).encode())
                return
            
            response = create_contact_message(post_data)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Update message status (admin only)
        elif path == '/messages/status':
            auth_header = self.headers.get('Authorization', '')
            
            # Verify admin token and extract user info
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json_dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json_dumps({"error": payload["error"]}).encode())
                return
            
            # Check if user is admin
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json_dumps({"error": "Unauthorized access: Admin privileges required"}).encode())
                return
            
            # Check required fields
            if 'message_id' not in post_data or 'status' not in post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Message ID and status required"}).encode())
                return
            
            response = update_message_status(post_data['message_id'], post_data['status'])
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(200)
            
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Default 404 response
        self._set_response(404)
        self.wfile.write(json_dumps({"error": "Resource not found"}).encode())
    
    # ... [keep the existing code for do_PUT and do_DELETE methods]

def main():
    """Start the server"""
    # Initialize the database
    print("Initializing database...")
    initialize_database()
    
    # Create the uploads directory if it doesn't exist
    print(f"Ensuring uploads directory exists at: {UPLOADS_DIR}")
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    
    # Create an HTTP server
    print(f"Starting server on port {PORT}...")
    httpd = socketserver.ThreadingTCPServer(("", PORT), RequestHandler)
    print(f"Server running on port {PORT}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        httpd.server_close()
        print("Server closed")

if __name__ == "__main__":
    main()
