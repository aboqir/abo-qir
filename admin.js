const correctPassword = "123789"; // كلمة المرور الصحيحة
const passwordSection = document.getElementById("passwordSection");
const adminContent = document.getElementById("adminContent");
const passwordInput = document.getElementById("password");
const passwordMessage = document.getElementById("passwordMessage");
const dailySummaryTableBody = document.getElementById("dailySummary").getElementsByTagName("tbody")[0];
const detailedReportTableBody = document.getElementById("detailedReport").getElementsByTagName("tbody")[0];
const ordersListTableBody = document.getElementById("ordersList").getElementsByTagName("tbody")[0];
const selectAllCheckbox = document.getElementById("selectAll"); // زر تحديد الكل
const allowedEmployees = ["علاء", "صالح", "فرغلي", "خليفة"]; // قائمة الموظفين المسموح بهم
let allSales = []; // لتخزين جميع بيانات المبيعات

function checkPassword() {
    if (passwordInput.value === correctPassword) {
        passwordSection.style.display = "none";
        adminContent.style.display = "block";
        loadSalesData();
    } else {
        passwordMessage.textContent = "كلمة المرور غير صحيحة.";
    }
}

function loadSalesData() {
    const salesData = localStorage.getItem("sales");
    allSales = salesData ? JSON.parse(salesData) : [];

    displayOrdersList(allSales);
    displayDailySummary(allSales);
    displayDetailedReport(allSales);
}

function displayOrdersList(sales) {
    ordersListTableBody.innerHTML = "";
    sales.forEach((sale, index) => {
        const row = ordersListTableBody.insertRow();
        const selectCell = row.insertCell();
        const nameCell = row.insertCell();
        const fishCell = row.insertCell();
        const quantityCell = row.insertCell();
        const unitCell = row.insertCell();
        const timeCell = row.insertCell();
        const manualNumberCell = row.insertCell(); // خلية الرقم اليدوي

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = index;
        selectCell.appendChild(checkbox);

        nameCell.textContent = sale.employeeName;
        fishCell.textContent = sale.fishType;
        quantityCell.textContent = sale.quantity;
        unitCell.textContent = sale.unit;
        timeCell.textContent = sale.timestamp;
        manualNumberCell.textContent = sale.manualNumber; // عرض الرقم اليدوي
    });
}

function displayDailySummary(sales) {
    const dailySummary = {};

    sales.forEach(sale => {
        if (allowedEmployees.includes(sale.employeeName)) {
            const key = sale.employeeName;
            if (!dailySummary[key]) {
                dailySummary[key] = { totalQuantity: 0, totalBonus: 0, manualNumbers: [] }; // تخزين الأرقام اليدوية
            }
            const quantityInKg = sale.unit === "جرام" ? sale.quantity / 1000 : sale.quantity;
            dailySummary[key].totalQuantity += quantityInKg;
            dailySummary[key].totalBonus += calculateBonus(sale.fishType, quantityInKg);
            if (sale.manualNumber) {
                dailySummary[key].manualNumbers.push(sale.manualNumber);
            }
        }
    });

    dailySummaryTableBody.innerHTML = "";
    for (const employee in dailySummary) {
        const row = dailySummaryTableBody.insertRow();
        const nameCell = row.insertCell();
        const quantityCell = row.insertCell();
        const bonusCell = row.insertCell();
        const manualNumbersCell = row.insertCell(); // خلية إجمالي الأرقام اليدوية

        nameCell.textContent = employee;
        quantityCell.textContent = dailySummary[employee].totalQuantity.toFixed(2);
        bonusCell.textContent = dailySummary[employee].totalBonus.toFixed(2);
        manualNumbersCell.textContent = dailySummary[employee].manualNumbers.join(", "); // عرض الأرقام اليدوية مفصولة
    }
}

function displayDetailedReport(sales) {
    detailedReportTableBody.innerHTML = "";
    sales.forEach(sale => {
        const row = detailedReportTableBody.insertRow();
        const nameCell = row.insertCell();
        const fishCell = row.insertCell();
        const quantityCell = row.insertCell();
        const unitCell = row.insertCell();
        const timeCell = row.insertCell();
        const bonusCell = row.insertCell();
        const manualNumberCell = row.insertCell(); // خلية الرقم اليدوي

        const quantityInKg = sale.unit === "جرام" ? sale.quantity / 1000 : sale.quantity;
        const bonus = calculateBonus(sale.fishType, quantityInKg);

        nameCell.textContent = sale.employeeName;
        fishCell.textContent = sale.fishType;
        quantityCell.textContent = sale.quantity;
        unitCell.textContent = sale.unit;
        timeCell.textContent = sale.timestamp;
        bonusCell.textContent = bonus.toFixed(2);
        manualNumberCell.textContent = sale.manualNumber; // عرض الرقم اليدوي
    });
}

function calculateBonus(fishType, quantity) {
    let bonusRate = 0;
    switch (fishType) {
        case "مرجان":
        case "سبيط":
        case "تعبان":
        case "موسى":
        case "سھلیة":
        case "بربوني":
        case "ناجل":
        case "قشر بياض":
        case "جمبري 800 لحم":
        case "جمبري 850":
        case "بطارخ":
        case "شعور":
            bonusRate = 20;
            break;
        case "رنجة سليمة":
            bonusRate = 5;
            break;
        case "رنجة مخلية":
            bonusRate = 30;
            break;
        case "دينيس":
            bonusRate = 10;
            break;
        case "قاروص":
        case "سلمون":
        case "لوت":
            bonusRate = 20;
            break;
        case "كفتة":
            bonusRate = 40;
            break;
        case "فسيخ":
            bonusRate = 30;
            break;
        case "جمبري 800 قشر":
            bonusRate = 10;
            break;
        default:
            bonusRate = 0;
    }
    return quantity * bonusRate;
}

function exportToExcel() {
    const salesData = localStorage.getItem("sales");
    const sales = salesData ? JSON.parse(salesData) : [];

    if (sales.length === 0) {
        alert("لا يوجد بيانات للتصدير.");
        return;
    }

    const workbook = XLSX.utils.book_new();
    const employees = [...new Set(sales.map(sale => sale.employeeName))];

    // إنشاء ورقة لكل موظف (تقرير مفصل)
    employees.forEach(employee => {
        const employeeSales = sales.filter(sale => sale.employeeName === employee);

        const headers = ["اسم الموظف", "نوع السمك", "الكمية", "الوحدة", "وقت البيع", "المكافأة (بالجنيه)", "الرقم اليدوي"];
        const data = [headers];

        employeeSales.forEach(sale => {
            const quantityInKg = sale.unit === "جرام" ? sale.quantity / 1000 : sale.quantity;
            const bonus = calculateBonus(sale.fishType, quantityInKg);
            data.push([sale.employeeName, sale.fishType, sale.quantity, sale.unit, sale.timestamp, bonus.toFixed(2), sale.manualNumber]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, employee);
    });

    // إنشاء ورقة ملخص المبيعات
    const summaryHeaders = ["اسم الموظف", "إجمالي المبيعات (بالكيلو)", "إجمالي المكافآت (بالجنيه)", "الأرقام اليدوية"];
    const summaryData = [summaryHeaders];

    const dailySummary = {};
    sales.forEach(sale => {
        if (allowedEmployees.includes(sale.employeeName)) {
            const key = sale.employeeName;
            if (!dailySummary[key]) {
                dailySummary[key] = { totalQuantity: 0, totalBonus: 0, manualNumbers: [] };
            }
            const quantityInKg = sale.unit === "جرام" ? sale.quantity / 1000 : sale.quantity;
            dailySummary[key].totalQuantity += quantityInKg;
            dailySummary[key].totalBonus += calculateBonus(sale.fishType, quantityInKg);
            if (sale.manualNumber) {
                dailySummary[key].manualNumbers.push(sale.manualNumber);
            }
        }
    });

    for (const employee in dailySummary) {
        summaryData.push([employee, dailySummary[employee].totalQuantity.toFixed(2), dailySummary[employee].totalBonus.toFixed(2), dailySummary[employee].manualNumbers.join(", ")]);
    }

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "ملخص المبيعات");

    XLSX.writeFile(workbook, "مبيعات_السمك.xlsx");
}

function printReport() {
    window.print();
}

function endOfDayReport() {
    const salesData = localStorage.getItem("sales");
    const sales = salesData ? JSON.parse(salesData) : [];
    const endOfDaySummary = {};

    sales.forEach(sale => {
        if (allowedEmployees.includes(sale.employeeName)) {
            const key = sale.employeeName;
            if (!endOfDaySummary[key]) {
                endOfDaySummary[key] = { totalQuantity: 0, totalBonus: 0, manualNumbers: [] };
            }
            const quantityInKg = sale.unit === "جرام" ? sale.quantity / 1000 : sale.quantity;
            endOfDaySummary[key].totalQuantity += quantityInKg;
            endOfDaySummary[key].totalBonus += calculateBonus(sale.fishType, quantityInKg);
            if (sale.manualNumber) {
                endOfDaySummary[key].manualNumbers.push(sale.manualNumber);
            }
        }
    });

    let reportText = "تقرير انتهاء الوردية:\n\n";
    for (const employee in endOfDaySummary) {
        reportText += `اسم الموظف: ${employee}\n`;
        reportText += `إجمالي المبيعات: ${endOfDaySummary[employee].totalQuantity.toFixed(2)} كيلو\n`;
        reportText += `إجمالي المكافآت: ${endOfDaySummary[employee].totalBonus.toFixed(2)} جنيه\n`;
        reportText += `الأرقام اليدوية: ${endOfDaySummary[employee].manualNumbers.join(", ")}\n\n`;
    }

    alert(reportText);
}

function deleteSelectedOrders() {
    const checkboxes = document.querySelectorAll("#ordersList tbody input[type='checkbox']:checked");
    const indicesToDelete = Array.from(checkboxes).map(cb => parseInt(cb.value)).sort((a, b) => b - a); // ترتيب تنازلي لتجنب تغيير الفهارس

    if (indicesToDelete.length === 0) {
        alert("الرجاء تحديد الأوردرات التي تريد مسحها.");
        return;
    }

    const confirmation = confirm(`هل أنت متأكد من أنك تريد مسح ${indicesToDelete.length} أوردر؟`);
    if (confirmation) {
        let sales = JSON.parse(localStorage.getItem("sales"));
        indicesToDelete.forEach(index => {
            sales.splice(index, 1);
        });
        localStorage.setItem("sales", JSON.stringify(sales));
        alert("تم مسح الأوردرات المحددة بنجاح.");
        loadSalesData(); // إعادة تحميل البيانات لتحديث القائمة والجداول
    }
}

function deleteAllOrders() {
    const confirmation = confirm("هل أنت متأكد من أنك تريد مسح جميع الأوردرات؟");
    if (confirmation) {
        localStorage.removeItem("sales");
        alert("تم مسح جميع الأوردرات بنجاح.");
        loadSalesData(); // إعادة تحميل البيانات لتحديث القائمة والجداول
    }
}

// إضافة وظيفة تحديد/إلغاء تحديد الكل
if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll("#ordersList tbody input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
}