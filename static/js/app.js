function buildMetadata(sample) {

  // Select the id to populate sample metadata
  var sampleData = d3.select("#sampleData");
  // Clear any existing metadata
  sampleData.html("");
  // Fetch the metadata for a sample
  var url = "/metadata/" + sample;
  d3.json(url).then(function(d) {
    for (let [key, value] of Object.entries(d)) {
      sampleData.append("p").attr("class", "card-text").text(key + ": " + value);
    }
    
    // Build the Gauge Chart
    // Enter a speed between 0 and 180
    var level = d.WFREQ * 20;

    // Trig to calc meter point
    var degrees = 180 - level,
	  radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
	  pathX = String(x),
	  space = ' ',
	  pathY = String(y),
	  pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
                x: [0], y:[0],
               marker: {size: 18, color:'850000'},
               showlegend: false},
               { 
                values: [50/9,50/9,50/9,50/9,50/9,50/9,50/9,50/9,50/9,50],
                rotation: 90,
                direction: 'clockwise',
                text: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", ""],
                textinfo: 'text',
                textposition:'inside',	  
                marker: {colors:['rgb(255,255,204)', 'rgb(229,255,204)',
                          'rgb(204,255,204)', 'rgb(153,255,153)',
                          'rgb(0,255,0)', 'rgb(102,255,178)', 
                          'rgb(0,204,0)', 'rgb(0,153,0)',
                           'rgb(0,102,0)', 'rgb(255,255,255)']},
               hole: .5,
               type: 'pie',
               showlegend: false
             }];

    var layout = {
                  shapes:[{type: 'path',
                           path: path,
                           fillcolor: '850000',
                           line: {color: '850000'},
                           
                          }],
                  title: {text: "<b>Belly Button Washing Frequency</b><br>Scrubs per week"},
                  
                  height: 450,
                  width: 450, 
                  xaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]},
                  yaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]}
                };
    Plotly.newPlot('gauge',data,layout);
  });
  
  }
  
  
  function buildCharts(sample) {

    var url = "/samples/" + sample;
  
    // Build a pie chart
    d3.json(url).then(function(data) {
      console.log(data);
      var data = [{
        values: data.sample_values.slice(0,10),
        labels: data.otu_ids.slice(0,10),
        hovertext: data.otu_labels.slice(0,10),
        hoverinfo: 'text',
        type: 'pie'
      }];
      
      var layout = {
        height: 600,
        width: 600
      };
      
      Plotly.newPlot('pie', data, layout);
      
    });
  
    // Build a Bubble Chart
    d3.json(url).then(function(data) {
      
      var data = [{
        x: data.otu_ids,
        y: data.sample_values,
        text: data.otu_labels,
        mode: 'markers',
        marker: {
          size: data.sample_values,
          color: data.otu_ids
          
        }
      }];
      
      var layout = {
        xaxis: { title: "OTU ID" }
      };
      
      Plotly.newPlot('bubble', data, layout);
      
    });
  
  }
  
  function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");
  
    // Use the list of sample names to populate the select options
    d3.json("/names").then((sampleNames) => {
      sampleNames.forEach((sample) => {
        selector
          .append("option")
          .text(sample)
          .property("value", sample);
      });
  
      // Use the first sample from the list to build the initial plots
      const firstSample = sampleNames[0];
      buildCharts(firstSample);
      buildMetadata(firstSample);
    });
  }
  
  function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
  }
  
  // Initialize the dashboard
  init();
  