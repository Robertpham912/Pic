// Biến toàn cục lưu trữ tên người chơi đang đăng nhập hiện tại
let currentUser = null;

// Hàm chuyển đổi linh hoạt giữa các màn hình UI công năng
const windowsList = ['mainPortal', 'skinStudio', 'mapStudio', 'gameLobby', 'registerWindow', 'loginWindow'];
function switchWindow(targetId) {
    windowsList.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === targetId) ? 'block' : 'none';
    });
    // Nếu chuyển sang studio vẽ map, gọi hàm vẽ để cập nhật khung lưới canvas
    if (targetId === 'mapStudio' && typeof drawEditor === 'function') {
        drawEditor();
    }
}

function showRoomSection() { document.getElementById("roomSection").style.display = "block"; }
function hideRoomSection() { document.getElementById("roomSection").style.display = "none"; }

// Xử lý Đăng Ký Tài Khoản mới
function handleRegister() {
    const user = document.getElementById("regUser").value.trim();
    const pass = document.getElementById("regPass").value.trim();
    
    if (user === "" || pass === "") {
        alert("⚠️ Vui lòng điền đầy đủ Tên tài khoản và Mật khẩu!");
        return;
    }
    
    // Kiểm tra xem tài khoản đã tồn tại trong LocalStorage chưa
    if (localStorage.getItem("db_user_" + user)) {
        alert("❌ Tài khoản này đã tồn tại! Vui lòng chọn tên khác.");
    } else {
        localStorage.setItem("db_user_" + user, pass);
        alert("🎉 Đăng ký thành công! Hãy dùng tài khoản này để đăng nhập.");
        switchWindow('loginWindow');
    }
}

// Xử lý Đăng Nhập Hệ Thống
function handleLogin() {
    const user = document.getElementById("logUser").value.trim();
    const pass = document.getElementById("logPass").value.trim();
    
    const savedPassword = localStorage.getItem("db_user_" + user);
    
    if (savedPassword && savedPassword === pass) {
        currentUser = user;
        alert(`👋 Chào mừng quay trở lại, ${currentUser}!`);
        updateAccountUI();
        switchWindow('mainPortal');
    } else {
        alert("❌ Sai tên đăng nhập hoặc mật khẩu không chính xác!");
    }
}

// Xử lý Đăng Xuất Hệ Thống
function handleLogout() {
    currentUser = null;
    alert("🔒 Bạn đã đăng xuất an toàn.");
    updateAccountUI();
    switchWindow('mainPortal');
}

// Cập nhật trạng thái hiển thị trên giao diện theo phân quyền đăng nhập
function updateAccountUI() {
    const navInfo = document.getElementById("navUserInfo");
    const navAuth = document.getElementById("navAuthButtons");
    
    const btnMap = document.getElementById("btnMap");
    const btnSkin = document.getElementById("btnSkin");
    const btnPlay = document.getElementById("btnPlay");

    if (currentUser) {
        // Trạng thái đã đăng nhập: Mở khóa tất cả tính năng sáng tạo
        navInfo.innerHTML = `Tài khoản: <span class="logged-name">${currentUser}</span> 👑`;
        navAuth.innerHTML = `<button class="btn-action btn-red" onclick="handleLogout()">Đăng Xuất</button>`;
        
        btnMap.disabled = false;
        btnSkin.disabled = false;
        btnPlay.disabled = false;
    } else {
        // Trạng thái chưa đăng nhập: Khóa các nút để ép người dùng định danh
        navInfo.innerHTML = `Trạng thái: <span class="status-logged-out">Chưa đăng nhập</span> (Vui lòng đăng nhập để chơi)`;
        navAuth.innerHTML = `
            <button class="btn-action btn-blue" onclick="switchWindow('loginWindow')">Đăng Nhập</button>
            <button class="btn-action btn-green" onclick="switchWindow('registerWindow')">Đăng Ký</button>
        `;
        btnMap.disabled = true;
        btnSkin.disabled = true;
        btnPlay.disabled = true;
        hideRoomSection();
    }
}
