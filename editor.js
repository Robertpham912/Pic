const lCanvas = document.getElementById("lobbyCanvas");
const lCtx = lCanvas.getContext("2d");

const GRAVITY = 0.4; // Lực hút kéo nhân vật rơi xuống
const KEYS = {};     // Mảng ghi nhớ các nút đang nhấn giữ trên bàn phím

// Đối tượng thông số vật lý của nhân vật
let playerObj = { 
    x: 60, y: 60, 
    width: 24, height: 32, 
    vx: 0, vy: 0, 
    speed: 4, 
    jumpForce: 8.8, 
    isGrounded: false 
};

window.addEventListener("keydown", (e) => KEYS[e.code] = true);
window.addEventListener("keyup", (e) => KEYS[e.code] = false);

// Hàm kích hoạt chuyển giao thức mở phòng game chờ
function enterGameRoom(createMode) {
    const inputField = document.getElementById("roomCodeInput");
    let code = createMode ? Math.random().toString(36).substring(2, 7).toUpperCase() : inputField.value.trim().toUpperCase();
    
    if (!createMode && code === "") { 
        alert("⚠️ Bạn vui lòng nhập mã code phòng của bạn bè!"); 
        return; 
    }
    
    document.getElementById("roomIdentityDisplay").innerText = createMode ? `👑 CHỦ PHÒNG - MÃ CODE: ${code}` : `🎮 THÀNH VIÊN - PHÒNG: ${code}`;
    
    // Đặt lại vị trí ban đầu tránh kẹt lửng lơ
    playerObj.x = 60; 
    playerObj.y = 60; 
    playerObj.vx = 0; 
    playerObj.vy = 0;
    
    switchWindow('gameLobby');
}

// VÒNG LẶP CHÍNH (GAME LOOP) XỬ LÝ CHUYỂN ĐỘNG VÀ VA CHẠM KHỐI
function lobbyGameLoop() {
    // Chỉ tính toán và vẽ nếu màn hình sảnh chờ đang mở rộng bật hiển thị
    if (document.getElementById("gameLobby").style.display === "block") {
        
        // Điều khiển sang trái/phải
        if (KEYS["KeyA"] || KEYS["ArrowLeft"]) playerObj.vx = -playerObj.speed;
        else if (KEYS["KeyD"] || KEYS["ArrowRight"]) playerObj.vx = playerObj.speed;
        else playerObj.vx = 0;

        // Trọng lực kéo rơi tự do xuống nền
        playerObj.vy += GRAVITY; 
        
        // Cập nhật vị trí X và giữ nhân vật trong giới hạn chiều ngang canvas
        playerObj.x += playerObj.vx;
        if (playerObj.x < 0) playerObj.x = 0;
        if (playerObj.x > lCanvas.width - playerObj.width) playerObj.x = lCanvas.width - playerObj.width;

        // Cập nhật vị trí trục đứng Y
        playerObj.y += playerObj.vy;
        playerObj.isGrounded = false;

        // QUÉT TÍNH TOÁN VA CHẠM TRỰC TIẾP VỚI MAP TỰ VẼ (Dựa vào ma trận từ file editor.js)
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (customMap[r][c] === 1) { // Gặp khối đất cứng
                    let platRect = { x: c * TILE_SIZE, y: r * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                    
                    // Thuật toán kiểm tra giao nhau hộp AABB
                    if (playerObj.x < platRect.x + platRect.width && playerObj.x + playerObj.width > platRect.x &&
                        playerObj.y < platRect.y + platRect.height && playerObj.y + playerObj.height > platRect.y) {
                        
                        if (playerObj.vy > 0) { // Đang rơi từ trên xuống nền gạch
                            playerObj.y = platRect.y - playerObj.height;
                            playerObj.vy = 0;
                            playerObj.isGrounded = true;
                        } else if (playerObj.vy < 0) { // Nhảy va đầu từ dưới lên
                            playerObj.y = platRect.y + platRect.height;
                            playerObj.vy = 0;
                        }
                    }
                } else if (customMap[r][c] === 2) { // Gặp khối gai nhọn bẫy
                    let spikeRect = { x: c * TILE_SIZE, y: r * TILE_SIZE + 12, width: TILE_SIZE, height: TILE_SIZE - 12 };
                    if (playerObj.x < spikeRect.x + spikeRect.width && playerObj.x + playerObj.width > spikeRect.x &&
                        playerObj.y < spikeRect.y + spikeRect.height && playerObj.y + playerObj.height > spikeRect.y) {
                        
                        // Dính bẫy: Đưa nhân vật quay đầu tái sinh tức khắc về điểm an toàn
                        playerObj.x = 60; playerObj.y = 60; playerObj.vx = 0; playerObj.vy = 0;
                    }
                }
            }
        }

        // Nhảy lên cao bằng phím Space hoặc W khi đang đứng vững trên gạch đất
        if ((KEYS["KeyW"] || KEYS["Space"]) && playerObj.isGrounded) {
            playerObj.vy = -playerObj.jumpForce;
            playerObj.isGrounded = false;
        }

        // XÓA KHUNG VÀ VẼ LẠI TOÀN BỘ ĐỒ HỌA MÀN HÌNH GAME
        lCtx.clearRect(0, 0, lCanvas.width, lCanvas.height);
        
        // 1. Vẽ các khối vật thể map tự tay thiết kế sang sảnh game
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (customMap[r][c] === 1) {
                    lCtx.fillStyle = "#3e445b"; lCtx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    lCtx.fillStyle = "#6c757d"; lCtx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, 3);
                } else if (customMap[r][c] === 2) {
                    lCtx.fillStyle = "#ff4757";
                    lCtx.beginPath();
                    lCtx.moveTo(c * TILE_SIZE, (r + 1) * TILE_SIZE);
                    lCtx.lineTo(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE);
                    lCtx.lineTo((c + 1) * TILE_SIZE, (r + 1) * TILE_SIZE);
                    lCtx.fill();
                }
            }
        }

        // 2. Tái tạo vẽ nhân vật khoác tấm áo Pixel 16x16 tự tô
        const pW = playerObj.width / 16;
        const pH = playerObj.height / 16;
        for (let r = 0; r < 16; r++) {
            for (let c = 0; c < 16; c++) {
                lCtx.fillStyle = playerSkin[r][c];
                lCtx.fillRect(playerObj.x + (c * pW), playerObj.y + (r * pH), pW + 0.3, pH + 0.3);
            }
        }
        
        // Vẽ thêm đôi mắt nhỏ hướng theo chiều chạy ngang của nhân vật
        lCtx.fillStyle = "#ffffff";
        lCtx.fillRect(playerObj.vx >= 0 ? playerObj.x + 15 : playerObj.x + 4, playerObj.y + 6, 5, 5);
    }
    
    // Kích hoạt chạy vòng lặp liên tiếp vô tận mượt mà
    requestAnimationFrame(lobbyGameLoop);
}

// Bật chạy kích hoạt vòng lặp game
lobbyGameLoop();
