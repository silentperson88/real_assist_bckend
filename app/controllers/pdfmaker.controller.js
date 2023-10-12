const PDFDocument = require('pdfkit');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { default: axios } = require('axios');

// Function to create a Chart using Chart.js and return a canvas
async function createChart() {
  const width = 400; // Canvas width
  const height = 200; // Canvas height

  const data = await axios
    .get(
      'https://api.usa.gov/crime/fbi/cde/arrest/state/AK/all?from=2015&to=2020&API_KEY=iiHnOKfno2Mgkt5AynpvPpUQTEyxE77jo1RU8PIv'
    )
    .then(res => res.data)
    .catch(err => err);

  const labels = [];
  const values = [];

  data.data.forEach(item => {
    labels.push(item.data_year);
    values.push(item.Burglary);
  });

  // Initialize a new chart configuration
  const configuration = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Burglary',
          data: values,
          borderColor: 'blue', // Line color
          fill: false, // No fill under the line
        },
      ],
    },
  };

  // Initialize the chart node canvas
  const chartNodeCanvas = new ChartJSNodeCanvas({ width, height });

  // eslint-disable-next-line no-useless-catch
  try {
    // Render the chart
    const image = await chartNodeCanvas.renderToBuffer(configuration);
    return image;
  } catch (error) {
    // Handle any errors that may occur during chart rendering
    throw error;
  }
}

exports.exportPdf = async (req, res) => {
  try {
    // Create a PDF document
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    const pageWidth = doc.page.width;

    // Function to add a horizontal blue line
    // eslint-disable-next-line no-inner-declarations
    function addHorizontalLine(marginTopBottom) {
      doc
        .lineWidth(2) // Adjust line width as needed
        .moveTo(20, doc.y + marginTopBottom) // Starting point (x, y)
        .lineTo(pageWidth - 20, doc.y + marginTopBottom) // Ending point (x, y)
        .strokeColor('blue') // Line color
        .stroke();
    }

    doc.pipe(res);

    // Add a header
    doc.font('Helvetica-Bold');
    doc.fontSize(20);
    doc.text('Crime', 50, doc.y - 15, { align: 'left' });

    // Calculate the right-side position for the line
    const lineX = pageWidth - 500;

    doc
      .lineWidth(2) // Adjust line width as needed
      .moveTo(lineX, doc.y - 15) // Starting point (x, y)
      .lineTo(pageWidth - 20, doc.y - 15) // Ending point (x, y)
      .strokeColor('blue') // Line color
      .stroke();

    doc.fontSize(10);
    doc.text('RealAssist.AI', 50, 20, { align: 'left' });
    doc.text('123 Main Street, Dover, NH 03820-4667', 350, 20, { align: 'right' });
    addHorizontalLine(5);

    // Create a Chart using Chart.js and export it as an image
    const chartImage = await createChart();

    // Embed the chart image into the PDF
    doc.image(chartImage, {
      align: 'center',
      x: 100,
      y: 100,
      width: 400,
      height: 200,
    });

    // Add a footer
    doc.font('Helvetica-Bold');
    doc.fontSize(10);
    // doc.text('Page 1', 450, pageHeight, { align: 'right' });

    const currenDate = new Date();

    doc.text(
      `Reported generate on ${currenDate.getDate()} ${
        currenDate.getMonth() + 1
      } ${currenDate.getFullYear()}`,
      50,
      doc.page.height - 20,
      {
        lineBreak: false,
      }
    );
    doc.text('Real Assist Propert Report', 400, doc.page.height - 20, {
      lineBreak: false,
    });
    addHorizontalLine(-5);

    // End the PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ error });
  }
};
