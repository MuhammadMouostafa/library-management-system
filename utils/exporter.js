const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");

async function exportData(res, data, format, filename = "export") {
  if (format === "csv") {
    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`${filename}.csv`);
    return res.send(csv);
  }

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // auto-generate headers based on object keys
    const columns = Object.keys(data[0] || {}).map(key => ({
      header: key,
      key,
      width: 20
    }));
    worksheet.columns = columns;

    data.forEach(row => worksheet.addRow(row));

    res.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.attachment(`${filename}.xlsx`);
    await workbook.xlsx.write(res);
    return res.end();
  }

  // default JSON fallback
  res.json(data);
}

module.exports = { exportData };
