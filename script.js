function saveSale() {
    const employeeName = document.getElementById("employeeName").value;
    const fishType = document.getElementById("fishType").value;
    const quantity = parseFloat(document.getElementById("quantity").value);
    const unit = document.getElementById("unit").value;
    const manualNumber = document.getElementById("manualNumber").value; // تم التقاط الرقم اليدوي
    const messageElement = document.getElementById("message");

    if (!employeeName || isNaN(quantity) || quantity <= 0) {
        messageElement.textContent = "الرجاء إدخال اسم الموظف والكمية بشكل صحيح.";
        return;
    }

    const saleData = {
        employeeName: employeeName,
        fishType: fishType,
        quantity: quantity,
        unit: unit,
        timestamp: new Date().toLocaleString(),
        manualNumber: manualNumber // تم تضمين الرقم اليدوي في بيانات البيع
    };

    let sales = localStorage.getItem("sales");
    sales = sales ? JSON.parse(sales) : [];
    sales.push(saleData);
    localStorage.setItem("sales", JSON.stringify(sales));

    messageElement.textContent = "تم تسجيل البيع بنجاح.";
    document.getElementById("salesForm").reset();
}