


function generateSalesPDF(doc, documents) {
   
    
            // Add the header - https://pspdfkit.com/blog/2019/generate-invoices-pdfkit-node/
            doc
                .image("./public/assets/images/logo.jpg", 50, 45, { width: 50 })
                .fillColor("#444444")
                .fontSize(20)
                .text("Sales Details", 0, 50,{align : 'center'})
                .fontSize(8)
                // .text("Sales Details of", 200, 50, { align: "right" })
                // .text(salesDate, 200, 60, { align: "right" })
                .moveDown();

            // Create the table - https://www.andronio.me/2017/09/02/pdfkit-tables/
            const table = {
                headers: ["id", "Customer Name","Products", "paymentMethod", "Total"],
                rows: []
            };

            let total = 0;

            for (let document of documents) {

                let productsArr = []

                for(let each of document.orderitems){
                    productsArr.push(each.productname)
                }
    
                table.rows.push([
                    document.orderid,
                    document.email,
                    productsArr.join(),
                    document.paymentmethod,
                    document.total
                ])

                total+=document.total
            }
            table.rows.push(['','','','total',total])

            // Draw the table
            doc.moveDown().table(table, 10, 125, { width: 590 });


    
    return doc;
}

module.exports = generateSalesPDF;
