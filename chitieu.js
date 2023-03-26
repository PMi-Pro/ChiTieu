// Các biến khởi tạo ban đầu
const form = document.querySelector("form");
const popup = document.querySelector(".divBasePopup");
const chonThang = document.querySelector("#chonThang");
const today = new Date();
document.querySelector("#date").value = `${today.getFullYear()}-${("0" + (today.getMonth() + 1)).slice(-2)}-${("0" + today.getDate()).slice(-2)}`;

// Tên phiên bản thông tin, tên DB và biến tạm tên cửa hàng trong DB
const version = "0.1 (Beta)";
const dbName = "ChiTieu";
let storeName;

// Khởi tạo cơ sở dữ liệu ban đầu
let idb = indexedDB.open(dbName, 1);
idb.onupgradeneeded = () => {
  if (!idb.result.objectStoreNames.contains("12")) {
    for (let i = 1; i <= 12; i++) {
      let create = idb.result.createObjectStore(i);
      create.createIndex("Date", "date", { unique: true });
    }
    localStorage.setItem("Year", today.getFullYear().toString());
    localStorage.setItem("ChiTieu", "");
    alert(`CHÀO MỪNG ĐẾN VỚI WEB CHI TIÊU\n
• Lưu Ý:
- Nếu xoá dữ liệu trang Web hoặc Cookies
  của trình duyệt, tất cả dữ liệu sẽ bị mất
- Riêng lịch sử duyệt Web có thể
  xoá bình thường\n
Nhấn OK để xem hướng dẫn`);
    huongDanSuDung();
  }
}

// Lưu dữ liệu năm cũ khi vào tháng 1 (nếu có dữ liệu)
setTimeout(() => {
  if ((today.getMonth() + 1) == 1 && localStorage.getItem("ChiTieu") == null && localStorage.getItem("Year") != today.getFullYear())
    thongKe(2);
  else if ((today.getMonth() + 1) != 1 && localStorage.getItem("ChiTieu") != null)
    localStorage.removeItem("ChiTieu");
}, 100);

// Biến tạm lấy ngày tháng hiện tại khi mở trang web
let days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
let dayName = days[today.getDay()];
let day = today.getDate();
chonThang.value = today.getMonth() + 1;
storeName = chonThang.value;

// Hàm thay đổi tháng của nút chọn tháng
thayDoiThang = () => {
  storeName = chonThang.value;
  layDuLieu();
}

// Thay đổi ngày để thêm dữ liệu (biến tạm và hàm dateChange ở dưới)
let todayCheck = 0;
let monthCheck = today.getMonth();
let idKey = today.getDate();

dateChange = (e) => {
  let todays = new Date(e.target.value);
  todayCheck = todays.getDate();
  monthCheck = todays.getMonth();
  idKey = todays.getDate();
  dayName = days[todays.getDay()];
  day = todays.getDate();
}

// Hàm của nút Menu
tuyChon = () => {
  let tc = document.querySelector("#tuyChon");
  if (tc.value == "tangca")
    window.open("./TangCa.html");
  else if (tc.value == "thongke")
    thongKe(1);
  else if (tc.value == "dulieucu") {
    if (localStorage.getItem("DuLieuChiTieu") != null)
      alert(localStorage.getItem("DuLieuChiTieu"));
    else alert("KHÔNG CÓ DỮ LIỆU!\n\nNếu hết tháng 12 hệ thống sẽ tự động lưu lại dữ liệu chi tiêu cũ (Nếu có dữ liệu)");
  }
  else if (tc.value == "huongdan")
    huongDanSuDung();
  else if (tc.value == "thongtin")
    alert(`Phiên Bản:  ${version}\nBản Quyền:  Sử Dụng Miễn Phí\nTác Giả:  Nguyễn Phương Minh\nLiên Hệ Hỗ Trợ:  0969442210 (Có Zalo)`);
  else if (tc.value == "xoatatca") {
    let checkDelete = prompt("Hệ thống sẽ xoá tất cả dữ liệu và đưa ứng dụng về mặc định\nNhập 123 nhấn OK để tiếp tục");
    if (checkDelete == "123") {
      indexedDB.deleteDatabase(dbName);
      window.location.reload();
      alert("Đã xoá tất cả dữ liệu!\nNhấn OK để khởi động lại");
    }
  }
  else if (tc.value == "nhatky")
    nhatKyPhienBan();
  tc.value = "menu";
}

// Hàm lấy dữ liệu
layDuLieu = () => {
  const thongTinTien = document.querySelector("#tienTong");
  const tbody = document.querySelector("table>tbody");
  let tong = xang = count = 0;
  let tien = Intl.NumberFormat();
  tbody.innerHTML = null;
  let idb = indexedDB.open(dbName, 1);
  idb.onsuccess = () => {
    let store = idb.result.transaction(storeName, 'readwrite').objectStore(storeName);
    let cursor = store.openCursor();
    cursor.onsuccess = () => {
      let curRes = cursor.result;
      if (curRes) {
        tong += curRes.value.tong;
        xang += curRes.value.xang;
        count++;
        tbody.innerHTML += `
                <tr>
                  <td onclick="update(${curRes.key})" style="background-color: ${curRes.value.date.includes("CN") ? "lightyellow" : "aliceblue"}">${curRes.value.ct}</td>
                  <td class="tdTien" style="color: brown; background-color: ${curRes.value.date.includes("CN") ? "lightyellow" : "aliceblue"}">${curRes.value.tien != curRes.value.tong ? tien.format(curRes.value.tien) : ""}</td>
                  <td class="tdTien" style="color: green; background-color: ${curRes.value.date.includes("CN") ? "lightyellow" : "aliceblue"}">${curRes.value.xang > 0 ? tien.format(curRes.value.xang) : ""}</td>
                  <td class="tdTien" style="color: red; background-color: ${curRes.value.date.includes("CN") ? "lightyellow" : "aliceblue"}">${tien.format(curRes.value.tong)}</td>
                  <td onclick="deletes(${curRes.key})" style="background-color: ${curRes.value.date.includes("CN") ? "lightyellow" : "aliceblue"}">${curRes.value.date}</td>
                </tr>`;
        curRes.continue();
      }
      else if (tong == 0) {
        thongTinTien.innerText = `Tháng ${(chonThang.value < 10 ? "0" : "") + chonThang.value} chưa có dữ liệu`;
        tbody.innerHTML = `<td onclick="showPopup()" style="height: 40px; font-size: 18px; background-color: lightgoldenrodyellow" colspan="6">Nhấn để thêm dữ liệu</td>`;
      }
      else thongTinTien.innerHTML = `Xăng: ${tien.format(xang)} đ   •   Chi: ${tien.format(tong - xang)} đ   •   ${count} Ngày<br>Tổng: ${tien.format(tong)} đ`;
    }
  }
}

layDuLieu(); // Lấy dữ liệu khi trang web được mở

// Nút thêm hiện cửa sổ dữ liệu
document.querySelector("#btnThem").addEventListener("click", () => {
  showPopup();
});

// Hàm thêm, sửa dữ liệu
const btnThemDuLieu = document.querySelector("#btnAddData");
btnThemDuLieu.addEventListener('click', () => {
  if (btnThemDuLieu.innerText == "Thêm") {
    if (form[0].value.length > 0 && parseInt(form[1].value) >= 0 && parseInt(form[3].value) >= 0) {
      let idb = indexedDB.open(dbName, 1);
      idb.onsuccess = () => {
        let store = idb.result.transaction(storeName, 'readwrite').objectStore(storeName);
        let checkAndUnique = store.add({
          ct: form[0].value,
          tien: form[1].value,
          xang: parseInt(form[3].value),
          tong: parseInt(form[1].value) + parseInt(form[3].value),
          date: `${dayName}.${(day < 10 ? "0" : "") + day}`,
        }, idKey);

        checkAndUnique.onsuccess = () => {
          layDuLieu();
          form[0].value = form[1].value = form[2].value = form[3].value = null;
          popup.style.display = "none";
          document.querySelector("#date").value = `${today.getFullYear()}-${("0" + (today.getMonth() + 1)).slice(-2)}-${("0" + today.getDate()).slice(-2)}`;
          dayName = days[today.getDay()];
          idKey = day = today.getDate();
        }

        checkAndUnique.onerror = () => {
          alert(`Dữ liệu  ${dayName}.${(day < 10 ? "0" : "") + day}  đã tồn tại!\nSửa lại dữ liệu hoặc chọn ngày khác`);
        }
      }
    }
    else alert("SỰ CỐ THÊM DỮ LIỆU!\n\nKiểm tra các sự cố sau:\n- Nội dung chi tiêu không được trống\n- Tiền chi tiêu không được trống\n- Tiền chi tiêu, xăng có giá trị nhỏ nhất là 0\n- Tiền chi tiêu, xăng chỉ nhận giá trị số\n- Tiền chi tiêu, xăng không bao gồm các ký tự");
  }
  else // Sửa, cập nhật
  {
    if (form[0].value.length > 0 && parseInt(form[1].value) >= 0 && parseInt(form[3].value) >= 0) {
      let idb = indexedDB.open(dbName, 1);
      idb.onsuccess = () => {
        let store = idb.result.transaction(storeName, 'readwrite').objectStore(storeName);
        store.put({
          ct: form[0].value,
          tien: form[1].value,
          xang: parseInt(form[3].value),
          tong: parseInt(form[1].value) + parseInt(form[3].value),
          date: dateTemp,
        }, updateKey);
        popup.style.display = "none";
        form[0].value = form[1].value = form[2].value = form[3].value = null;
        layDuLieu();
      }
    }
    else alert("SỰ CỐ CẬP NHẬT DỮ LIỆU!\n\nKiểm tra các sự cố sau:\n- Nội dung chi tiêu không được trống\n- Tiền chi tiêu không được trống\n- Tiền chi tiêu, xăng có giá trị nhỏ nhất là 0\n- Tiền chi tiêu, xăng chỉ nhận giá trị số\n- Tiền chi tiêu, xăng không bao gồm các ký tự");
  }
});

// Biến tạm lấy Key để cập nhật, và hàm cập nhật
let updateKey;
let dateTemp;

const noiDungPopup = document.querySelector("#noiDungPopup"); // Biến hiện cửa sổ chi tiêu cho hàm update và hàm showPopup sử dụng
update = (e) => {
  updateKey = e;
  let idb = indexedDB.open(dbName, 1);
  idb.onsuccess = () => {
    let store = idb.result.transaction(storeName, 'readwrite').objectStore(storeName).get(e);
    store.onsuccess = () => {
      form[0].value = store.result.ct;
      form[1].value = store.result.tien;
      form[3].value = store.result.xang;
      dateTemp = store.result.date;
      popup.style.display = "flex";
      noiDungPopup.innerText = `SỬA CHI TIÊU: ${store.result.date}`;
      document.querySelector("#textArea").focus();
      btnThemDuLieu.innerText = "C.Nhật";
    }
  }
}

// Hàm xoá dữ liệu với Key (e là key (idKey))
deletes = (e) => {
  let idb = indexedDB.open(dbName, 1);
  idb.onsuccess = () => {
    let store = idb.result.transaction(storeName, 'readwrite').objectStore(storeName);
    let obj = store.get(e);
    obj.onsuccess = () => {
      let check = confirm(`Xoá chi tiêu:  ${obj.result.date}  ?`);
      if (check) {
        store.delete(e);
        layDuLieu();
      }
    }
  }
}

// Nút tính tiền trong cửa sổ thêm dữ liệu
document.querySelector("#btnTinh").addEventListener("click", () => {
  if (parseInt(stringToNum(form[0].value)) > 0)
    form[1].value = stringToNum(form[0].value, 1000);
  else
    alert("Nội dung chi tiêu chưa có giá trị số!\n\nVí Dụ:\nNhập 10 => 10.000đ\nNhập 100 => 100.000đ\nNhập 1000 => 1.000.000đ\n\nGiá trị số đã nhập, sẽ nhân với 1000");
});

// Thoát cửa sổ thêm dữ liệu
document.querySelector("#btnThoat").addEventListener('click', () => {
  popup.style.display = "none";
});

// Hàm hiện cửa sổ thêm dữ liệu
showPopup = () => {
  if ((today.getDate() <= 3 && (today.getMonth() + 1) == 1) || (today.getDate() <= 3 && parseInt(chonThang.value) == today.getMonth()) || (parseInt(chonThang.value) == (today.getMonth() + 1) && todayCheck <= today.getDate() && monthCheck == today.getMonth())) {
    form[0].value = null;
    form[1].value = form[3].value = "0";
    popup.style.display = "flex";
    noiDungPopup.innerText = `THÊM CHI TIÊU: ${dayName}.${(day < 10 ? "0" : "") + day}`;
    document.querySelector("#textArea").focus();
    btnThemDuLieu.innerText = "Thêm";
  }
  else {
    document.querySelector("#date").value = `${today.getFullYear()}-${("0" + (today.getMonth() + 1)).slice(-2)}-${("0" + today.getDate()).slice(-2)}`;
    dayName = days[today.getDay()];
    idKey = day = todayCheck = today.getDate();
    monthCheck = today.getMonth();
    alert("Ngày tháng lựa chọn không hợp lệ!\nVui lòng kiểm tra lại");
  }
}

// Hàm tính tổng số có trong chuỗi
stringToNum = (str, x = 1) => {
  let sum = 0,
    tempn = 0;
  let tempns = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] == '1' || str[i] == '2' || str[i] == '3' || str[i] == '4' || str[i] == '5' || str[i] == '6' || str[i] == '7' || str[i] == '8' || str[i] == '9' || str[i] == '0') {
      while (str[i] == '1' || str[i] == '2' || str[i] == '3' || str[i] == '4' || str[i] == '5' || str[i] == '6' || str[i] == '7' || str[i] == '8' || str[i] == '9' || str[i] == '0') {
        tempns += str[i];
        i++;
      }
      i--;
      tempn = parseInt(tempns);
      sum += tempn;
      tempn = 0;
      tempns = "";
    }
  }
  return (sum * x).toString();
}

// Hàm thống kê, 1 xem thống kê, 2 lưu dữ liệu thống kê
thongKe = (show = 0) => {
  let tongXang = tongTien = x1 = x2 = x3 = x4 = x5 = x6 = x7 = x8 = x9 = x10 = x11 = x12 = 0;
  let t1 = t2 = t3 = t4 = t5 = t6 = t7 = t8 = t9 = t10 = t11 = t12 = 0;

  let idb = indexedDB.open(dbName, 1);
  idb.onsuccess = () => {

    let store1 = idb.result.transaction("1", 'readonly').objectStore("1");
    let cursor1 = store1.openCursor();
    cursor1.onsuccess = () => {
      if (cursor1.result) {
        x1 += cursor1.result.value.xang;
        t1 += cursor1.result.value.tong;
        cursor1.result.continue();
      }
      else {
        tongXang += x1;
        tongTien += t1;
      }
    }

    let store2 = idb.result.transaction("2", 'readonly').objectStore("2");
    let cursor2 = store2.openCursor();
    cursor2.onsuccess = () => {
      if (cursor2.result) {
        x2 += cursor2.result.value.xang;
        t2 += cursor2.result.value.tong;
        cursor2.result.continue();
      }
      else {
        tongXang += x2;
        tongTien += t2;
      }
    }

    let store3 = idb.result.transaction("3", 'readonly').objectStore("3");
    let cursor3 = store3.openCursor();
    cursor3.onsuccess = () => {
      if (cursor3.result) {
        x3 += cursor3.result.value.xang;
        t3 += cursor3.result.value.tong;
        cursor3.result.continue();
      }
      else {
        tongXang += x3;
        tongTien += t3;
      }
    }


    let store4 = idb.result.transaction("4", 'readonly').objectStore("4");
    let cursor4 = store4.openCursor();
    cursor4.onsuccess = () => {
      if (cursor4.result) {
        x4 += cursor4.result.value.xang;
        t4 += cursor4.result.value.tong;
        cursor4.result.continue();
      }
      else {
        tongXang += x4;
        tongTien += t4;
      }
    }

    let store5 = idb.result.transaction("5", 'readonly').objectStore("5");
    let cursor5 = store5.openCursor();
    cursor5.onsuccess = () => {
      if (cursor5.result) {
        x5 += cursor5.result.value.xang;
        t5 += cursor5.result.value.tong;
        cursor5.result.continue();
      }
      else {
        tongXang += x5;
        tongTien += t5;
      }
    }

    let store6 = idb.result.transaction("6", 'readonly').objectStore("6");
    let cursor6 = store6.openCursor();
    cursor6.onsuccess = () => {
      if (cursor6.result) {
        x6 += cursor6.result.value.xang;
        t6 += cursor6.result.value.tong;
        cursor6.result.continue();
      }
      else {
        tongXang += x6;
        tongTien += t6;
      }
    }

    let store7 = idb.result.transaction("7", 'readonly').objectStore("7");
    let cursor7 = store7.openCursor();
    cursor7.onsuccess = () => {
      if (cursor7.result) {
        x7 += cursor7.result.value.xang;
        t7 += cursor7.result.value.tong;
        cursor7.result.continue();
      }
      else {
        tongXang += x7;
        tongTien += t7;
      }
    }

    let store8 = idb.result.transaction("8", 'readonly').objectStore("8");
    let cursor8 = store8.openCursor();
    cursor8.onsuccess = () => {
      if (cursor8.result) {
        x8 += cursor8.result.value.xang;
        t8 += cursor8.result.value.tong;
        cursor8.result.continue();
      }
      else {
        tongXang += x8;
        tongTien += t8;
      }
    }

    let store9 = idb.result.transaction("9", 'readonly').objectStore("9");
    let cursor9 = store9.openCursor();
    cursor9.onsuccess = () => {
      if (cursor9.result) {
        x9 += cursor9.result.value.xang;
        t9 += cursor9.result.value.tong;
        cursor9.result.continue();
      }
      else {
        tongXang += x9;
        tongTien += t9;
      }
    }

    let store10 = idb.result.transaction("10", 'readonly').objectStore("10");
    let cursor10 = store10.openCursor();
    cursor10.onsuccess = () => {
      if (cursor10.result) {
        x10 += cursor10.result.value.xang;
        t10 += cursor10.result.value.tong;
        cursor10.result.continue();
      }
      else {
        tongXang += x10;
        tongTien += t10;
      }
    }

    let store11 = idb.result.transaction("11", 'readonly').objectStore("11");
    let cursor11 = store11.openCursor();
    cursor11.onsuccess = () => {
      if (cursor11.result) {
        x11 += cursor11.result.value.xang;
        t11 += cursor11.result.value.tong;
        cursor11.result.continue();
      }
      else {
        tongXang += x11;
        tongTien += t11;
      }
    }

    let tien = Intl.NumberFormat();
    let store12 = idb.result.transaction("12", 'readonly').objectStore("12");
    let cursor12 = store12.openCursor();
    cursor12.onsuccess = () => {
      if (cursor12.result) {
        x12 += cursor12.result.value.xang;
        t12 += cursor12.result.value.tong;
        cursor12.result.continue();
      }
      else {
        setTimeout(() => {
          tongXang += x12;
          tongTien += t12;
          let saveData = `THỐNG KÊ CHI TIÊU  ${localStorage.getItem("Year") ? localStorage.getItem("Year") : ""}
----------
T01:  Xăng: ${tien.format(x1)} | C.Tiêu: ${tien.format(t1 - x1)} | Tổng: ${tien.format(t1)}
T02:  Xăng: ${tien.format(x2)} | C.Tiêu: ${tien.format(t2 - x2)} | Tổng: ${tien.format(t2)}
T03:  Xăng: ${tien.format(x3)} | C.Tiêu: ${tien.format(t3 - x3)} | Tổng: ${tien.format(t3)}
T04:  Xăng: ${tien.format(x4)} | C.Tiêu: ${tien.format(t4 - x4)} | Tổng: ${tien.format(t4)}
T05:  Xăng: ${tien.format(x5)} | C.Tiêu: ${tien.format(t5 - x5)} | Tổng: ${tien.format(t5)}
T06:  Xăng: ${tien.format(x6)} | C.Tiêu: ${tien.format(t6 - x6)} | Tổng: ${tien.format(t6)}
T07:  Xăng: ${tien.format(x7)} | C.Tiêu: ${tien.format(t7 - x7)} | Tổng: ${tien.format(t7)}
T08:  Xăng: ${tien.format(x8)} | C.Tiêu: ${tien.format(t7 - x8)} | Tổng: ${tien.format(t8)}
T09:  Xăng: ${tien.format(x9)} | C.Tiêu: ${tien.format(t9 - x9)} | Tổng: ${tien.format(t9)}
T10:  Xăng: ${tien.format(x10)} | C.Tiêu: ${tien.format(t10 - x10)} | Tổng: ${tien.format(t10)}
T11:  Xăng: ${tien.format(x11)} | C.Tiêu: ${tien.format(t11 - x11)} | Tổng: ${tien.format(t11)}
T12:  Xăng: ${tien.format(x12)} | C.Tiêu: ${tien.format(t12 - x12)} | Tổng: ${tien.format(t12)}
----------
XĂNG:     ${tien.format(tongXang)} đ
C.TIÊU:    ${tien.format(tongTien - tongXang)} đ
TỔNG:     ${tien.format(tongTien)} đ`;

          if (show == 1) alert(saveData);
          else if (show == 2 && tongTien > 0) {
            localStorage.setItem("DuLieuChiTieu", saveData);
            alert(`ĐÃ LƯU DỮ LIỆU NĂM ${today.getFullYear() - 1}\n\nĐể xem lại dữ liệu ${today.getFullYear() - 1} vào:\n'Menu' => 'Dữ Liệu Đã Lưu'\n\nHệ thống đã xoá hết dữ liệu ${today.getFullYear() - 1} để bắt đầu sử dụng cho năm ${today.getFullYear()}\n\nNhấn OK để tiếp tục`);
            indexedDB.deleteDatabase(dbName);
            window.location.reload();
          }
        }, 100);
      }
    }
  }
}

// Hiện hướng dẫn trong Menu
huongDanSuDung = () => {
  setTimeout(() => {
    alert(`••• THANH BAR •••
1: Mục Tháng: Chọn tháng xem dữ liệu chi tiêu
2: Mục Thời Gian: Chọn ngày ghi chi tiêu tùy chọn, hoặc mặc định là ngày hiện tại (Áp dụng khi quên ghi)
3: Mục 'Menu': Các tùy chọn ứng dụng, như 'Thống Kê', 'Dữ Liệu Đã Lưu', 'Xoá Dữ Liệu' v.v..
4: Mục 'Thêm Chi Tiêu Mới' (Thanh ngang dưới cùng): Nhấn để thêm dữ liệu chi tiêu mới\n
••• BẢNG DỮ LIỆU •••
1: Mục 'Nội Dung Chi Tiêu':  Chọn các nội dung chi tiêu để sửa lại
2: Mục 'Thời Gian': Chọn thời gian ngày chi tiêu muốn xoá\n
••• LƯU Ý •••
1: Có thể thêm nội dung chi tiêu từ ngày hiện tại trở về trước (Trong tháng hiện tại), hoặc ghi dữ liệu vào tháng trước với điều kiện tháng hiện tại không quá 3 ngày
2: Không thể thêm dữ liệu khi ngày hoặc tháng đã chọn lớn hơn ngày, tháng hiện tại
3: Ngày chi tiêu đã thêm không được trùng nhau
4: Phần nút 'Tính' trong cửa sổ thêm chi tiêu để tính tiền nhanh khi nội dung chi tiêu có giá trị số, hoặc tự nhập thủ công
5: Phần nội dung 'Tiền Chi Tiêu' và 'Tiền Xăng' trong cửa sổ 'Thêm Chi Tiêu' có giá trị mặc định là 0, không được để trống khi lưu
6: Phần 'Thống Kê' trong 'Menu' để xem nhanh dữ liệu từ tháng 1 đến 12 (Có tổng kết dữ liệu trong năm)
7: Phần 'Xoá Dữ Liệu' trong Menu để xoá hết dữ liệu trong 12 tháng
8: Trong bảng dữ liệu, các hàng có màu vàng là Chủ Nhật, còn lại màu trắng`);
  }, 50);
};

// Hàm nhật ký phiên bản app
nhatKyPhienBan = () => {
  setTimeout(() => {
    alert(`• 0.1  Beta  -  20.03.2023
- Thêm, sửa, xoá dữ liệu
- Chọn ngày, chọn tháng xem, thêm dữ liệu
- Xem thống kê dữ liệu trong tháng, năm
- Xem dữ liệu đã lưu (Năm trước)
- Xem số ngày đã chi tiêu trong tháng
- Xoá dữ liệu (Đưa về mặc định)
- Tính tiền chi tiêu tự động với 1 nhấn
- Tự động lưu dữ liệu cũ khi sang năm mới`);
  }, 50);
}
