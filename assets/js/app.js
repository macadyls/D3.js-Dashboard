function makeSVG() {
    
    var svgWidth = 960;
    var svgHeight = 500;
    
    var margin = {
      top: 20,
      right: 40,
      bottom: 90,
      left: 100
    };
    
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;
    
    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);
    
    // Append an SVG group
    var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    
    // function used for updating x-scale var upon click on axis label
    function xScale(healthData, chosenXAxis) {
      // create scales
      var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
          d3.max(healthData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    
      return xLinearScale;
    
    }
    // function used for updating y-scale var upon click on axis label
    function yScale(healthData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
          .domain([0, d3.max(healthData, d => d[chosenYAxis]) +2])
          .range([height, 0]);
        return yLinearScale;
        }
    
    // function used for updating xAxis var upon click on axis label
    function renderAxes(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);
    
      xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
      return xAxis;
    }
    // function used for updating yAxis var upon click on axis label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        
        return yAxis;
    }
    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    
      circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]))
        ;
    
      return circlesGroup;
    }
    
    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {
    
      var labelx;
      var labelx_percent="";
      var labely;
      var labely_percent="";
    // determine the x label tip
      if (chosenXAxis === "poverty") {
        labelx = "Poverty:";
        labelx_percent="%";
      }
      else if (chosenXAxis === "age") {
        labelx = "Age:";
      }
      else {
        labelx = "Income:";
      }
    
    // determine the y label tip
      if (chosenYAxis === "healthcare") {
        labely = "Healthcare:";
        labely_percent="%";
      }
      else if (chosenYAxis === "smokes") {
        labely = "Smokes:";
        labely_percent="%";
      }
      else {
        labely = "Obesity:";
        labely_percent="%";
      }
      var toolTip = d3.tip()
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("color","white")
        .offset([0, 0])
        .html(function(d) {
          return (`${d.state}<br>${labelx} ${d[chosenXAxis]}${labelx_percent}
          <br>${labely} ${d[chosenYAxis]}${labely_percent} `);
        });
    
      circlesGroup.call(toolTip);
    
      circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });
    
      return circlesGroup;
    }
    
    // Retrieve data from the CSV file and execute everything below
    d3.csv("./assets/data/data.csv").then(function(healthData, err) {
      if (err) throw err;
    
      // parse data
      healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age ;
        data.obesity = +data.obesity; 
        data.smokes = +data.smokes; 
        data.income = +data.income; 
      });
    
      // xLinearScale function above csv import
      var xLinearScale = xScale(healthData, chosenXAxis);
    
      // Create y scale function
      var yLinearScale = yScale(healthData, chosenYAxis);     
    
      // Create initial axis functions
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft( yLinearScale);
    
      // append x axis
      var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
      // append y axis
      var yAxis = chartGroup.append("g")
        .call(leftAxis);
    
      function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        
        return yAxis;
        }
    
      // append initial circles
      // Append an SVG group
    
      var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 13)
        .attr("fill", "lightblue")
        .attr("opacity", ".9");
    
      var chartGroupText = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
      //  Create text for each circle based on its X, Y values using the State Abbreviation
      chartGroupText.selectAll("textCircle")
        .data(healthData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(d => d.abbr)
        .style("text-anchor", "middle")
        .style("fill","white")
        .style("font-family", "Arial")
        .style("font-size", 10);
    
      // Create group for three x-axis labels
      var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
      var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    
      var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
      var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    
     //   Create group for three y-axes labels
      var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .attr("transform", "rotate(-90)");
    
        var healthcareLabel = ylabelsGroup.append("text")
          .attr("y", 0 - margin.left+60 )
          .attr("x", 0 - (height / 2))
          .attr("value", "healthcare") // value to grab for event listener
          .classed("active", true)
          .text("Lacks Healthcare (%)");
      
        var smokesLabel = ylabelsGroup.append("text")
          .attr("y", 0 - margin.left + 40)
          .attr("x", 0 - (height / 2))
          .attr("value", "smokes") // value to grab for event listener
          .classed("inactive", true)
          .text("Smokes (%)");
    
        var obesityLabel = ylabelsGroup.append("text")
          .attr("y", 0 - margin.left + 20)
          .attr("x", 0 - (height / 2))
          .attr("value", "obesity") // value to grab for event listener
          .classed("inactive", true)
          .text("Obesity (%)");
    
    
      // updateToolTip function above csv import
      var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    
      // x axis labels event listener
      labelsGroup.selectAll("text")
        .on("click", function() {
          chartGroupText.selectAll("text").remove();
          // get value of selection
          var value = d3.select(this).attr("value");
    
          if (value !== chosenXAxis) {
            // replaces chosenXAxis with value
            chosenXAxis = value;
            console.log("x label value: ", value);
            console.log("x axis: ",chosenXAxis, " y axis: ", chosenYAxis);
    
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);
    
            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);
    
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    
            //  Create text for each circle based on its X, Y values using the State Abbreviation
            chartGroupText.selectAll("textCircle")
            .data(healthData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .text(d => d.abbr)
            .style("text-anchor", "middle")
            .style("fill","white")
            .style("font-family", "Arial")
            .style("font-size", 10);
    
            // changes classes to change bold text
            if (chosenXAxis === "age") {
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true); 
            }
            else if (chosenXAxis === "poverty") {
             povertyLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true); 
            }
            else {
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              povertyLabel
                .classed("active", false)
                .classed("inactive", true); 
            }
        }
      });
        // y axis labels event listener
        ylabelsGroup.selectAll("text")
        .on("click", function() {
    
          chartGroupText.selectAll("text").remove();
          // get value of selection
          var y_value = d3.select(this).attr("value");
          console.log("y label value: ", y_value);
          if (y_value !== chosenYAxis) {
            // replaces chosenXAxis with value
            chosenYAxis = y_value;
            // chartGroup.selectAll("text").remove();
            // console.log(chosenXAxis)
    
            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);
            xLinearScale = xScale(healthData, chosenXAxis);
            console.log("x axis: ",chosenXAxis, " y axis: ", chosenYAxis);
            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);
            // updates x axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);
    
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    
            //  Create text for each circle based on its X, Y values using the State Abbreviation
            chartGroupText.selectAll("textCircle")
            .data(healthData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .text(d => d.abbr)
            .style("text-anchor", "middle")
            .style("fill","white")
            .style("font-family", "Arial")
            .style("font-size", 10);
    
            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
              healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              obesityLabel
                .classed("active", false)
                .classed("inactive", true); 
            }
            else if (chosenYAxis === "smokes") {
              smokesLabel
                .classed("active", true)
                .classed("inactive", false);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
              obesityLabel
                .classed("active", false)
                .classed("inactive", true); 
            }
            else {
              obesityLabel
                .classed("active", true)
                .classed("inactive", false);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true); 
            }
        }
      });
    })
};
  
    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";
  
  makeSVG();