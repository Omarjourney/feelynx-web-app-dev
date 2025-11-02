import base64
import hashlib
import json
import logging
import socket
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from typing import Optional, Tuple

PORT = 8000
MAGIC_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
logger = logging.getLogger("backend")


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


class Handler(BaseHTTPRequestHandler):
    server_version = "FeelynxBackend/1.0"

    def log_message(self, format: str, *args) -> None:  # noqa: A003 - required signature
        logger.info("%s - - [%s] " + format, self.address_string(), self.log_date_time_string(), *args)

    def do_GET(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        upgrade = self.headers.get("Upgrade", "").lower()
        if self.path == "/health":
            self._handle_health()
        elif upgrade == "websocket" and self.path.startswith("/ws"):
            self._handle_websocket()
        else:
            self.send_error(HTTPStatus.NOT_FOUND, "Not Found")

    def _handle_health(self) -> None:
        payload = json.dumps({"status": "ok"}).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _handle_websocket(self) -> None:
        key = self.headers.get("Sec-WebSocket-Key")
        if not key:
            self.send_error(HTTPStatus.BAD_REQUEST, "Missing Sec-WebSocket-Key")
            return

        accept = base64.b64encode(hashlib.sha1((key + MAGIC_GUID).encode("utf-8")).digest()).decode("utf-8")

        self.send_response(HTTPStatus.SWITCHING_PROTOCOLS)
        self.send_header("Upgrade", "websocket")
        self.send_header("Connection", "Upgrade")
        self.send_header("Sec-WebSocket-Accept", accept)
        protocol = self.headers.get("Sec-WebSocket-Protocol")
        if protocol:
            self.send_header("Sec-WebSocket-Protocol", protocol)
        self.end_headers()

        self.close_connection = False
        try:
            while True:
                frame = self._read_frame()
                if frame is None:
                    break
                opcode, data = frame
                if opcode == 0x8:  # Close
                    break
                if opcode == 0x9:  # Ping
                    self._send_frame(data, opcode=0xA)
                elif opcode == 0x1:  # Text
                    self._send_frame(data, opcode=0x1)
        except ConnectionError:
            pass
        finally:
            try:
                self.request.shutdown(socket.SHUT_RDWR)
            except OSError:
                pass
            self.request.close()

    def _read_exactly(self, length: int) -> Optional[bytes]:
        data = self.rfile.read(length)
        if data is None or len(data) < length:
            return None
        return data

    def _read_frame(self) -> Optional[Tuple[int, bytes]]:
        header = self._read_exactly(2)
        if not header:
            return None
        byte1, byte2 = header
        opcode = byte1 & 0x0F
        masked = byte2 & 0x80
        payload_length = byte2 & 0x7F

        if payload_length == 126:
            extended = self._read_exactly(2)
            if not extended:
                return None
            payload_length = int.from_bytes(extended, "big")
        elif payload_length == 127:
            extended = self._read_exactly(8)
            if not extended:
                return None
            payload_length = int.from_bytes(extended, "big")

        mask_key = b""
        if masked:
            mask_key = self._read_exactly(4)
            if mask_key is None:
                return None

        payload = self._read_exactly(payload_length) if payload_length else b""
        if payload is None:
            return None

        if masked and mask_key:
            payload = bytes(b ^ mask_key[i % 4] for i, b in enumerate(payload))

        return opcode, payload

    def _send_frame(self, data: bytes, opcode: int = 0x1) -> None:
        if isinstance(data, str):
            payload = data.encode("utf-8")
        else:
            payload = data
        header = bytearray()
        header.append(0x80 | (opcode & 0x0F))
        length = len(payload)
        if length < 126:
            header.append(length)
        elif length < 65536:
            header.append(126)
            header.extend(length.to_bytes(2, "big"))
        else:
            header.append(127)
            header.extend(length.to_bytes(8, "big"))
        self.wfile.write(header)
        if payload:
            self.wfile.write(payload)
        self.wfile.flush()


def run() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    server = ThreadedHTTPServer(("0.0.0.0", PORT), Handler)
    logger.info("Starting backend server on port %s", PORT)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        logger.info("Server stopped")


if __name__ == "__main__":
    run()
