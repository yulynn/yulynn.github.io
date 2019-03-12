/*** to define the style */
var template = {
  width: 950,
  height: 600,
  margin: 20,
  json: '../data/world_country.json',
  csv: '../data/data.csv'
};

(function(data) {
  var $graph = d3
    .select('#chart')
    .append('svg')
    .attr('width', data.width)
    .attr('height', data.height - data.margin);
  var projection = d3
    .geoMercator()
    .scale(150)
    .translate([data.width / 2, data.height / 2 + 103]);
  var path;
  var fuels = {},
    countries = {},
    years = {};
  var filter = {
    country: 'all',
    year: 'all',
    fuel: 'all'
  };
  function loadJson(file) {
    return new Promise((resolve, reject) => {
      d3.json(file, function(error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  function loadData(file) {
    return new Promise((resolve, reject) => {
      d3.csv(file, function(error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  function renderPath(map_) {
    $graph
      .selectAll('path')
      .data(topojson.feature(map_, map_.objects.countries).features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', 'rgb(15, 26, 88)')
      .style('stroke', '#000');
  }

  function renderPoints(points) {
    // console.log(points.filter(d => !(isNaN(d.latitude) || isNaN(d.longitude))));
    $graph
      // .append('g')
      .selectAll('circle')
      .data(points.filter(d => !(isNaN(d.latitude) || isNaN(d.longitude))))
      .enter()
      .append('circle')
      .attr('cx', d => projection([d.longitude, d.latitude])[0])
      .attr('cy', d => projection([d.longitude, d.latitude])[1])
      .attr('r', 3)
      .style('fill', d => fuels[d.fuel1])
      .style('stroke', 'rgb(255,255,255)')
      .style('stroke-width', 0.25)
      .style('z-index', 1)
      .on('mouseover', function(d) {
        // console.log('onmouseover',this);
        d3.select(this)
          .attr('r', 8)
          .style('stroke', '#000')
          .attr('class', 'selected')
          .raise();
        // d3.selectAll('circle').classed('notselect',true)
        tooltip
          .transition()
          .duration(300)
          .style('opacity', 1); // show the tooltip
        tooltip
          .html(
            () => `${'country: ' + d.country_long + '<br/>'}
          ${'name: ' + d.name + '<br/>'}
					${'fuel: ' + d.fuel1 + '<br/>'}
					${'capacity: ' + d.capacity_mw + '<br/>'}
					${'owner: ' + d.owner + '<br/>'}
					${'source: ' + d.source + '<br/>'}`
          )
          .style(
            'left',
            d3.event.pageX -
              d3.select('.tooltip').node().offsetWidth -
              12 +
              'px'
          )
          .style(
            'top',
            d3.event.pageY - d3.select('.tooltip').node().offsetHeight + 'px'
          );
      })
      .on('mouseleave', function(d) {
        // d3.selectAll('circle').classed('notselect', false)
        d3.select(this)
          .attr('r', 3)
          .style('stroke', '#fff')
          .classed('selected', false);
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 0);
      });
  }

  function dragging() {
    var offset = projection.translate();

    offset[0] += d3.event.dx;
    offset[1] += d3.event.dy;

    projection.translate(offset);

    updateGraph();
  }

  function updateGraph() {
    $graph.selectAll('path').attr('d', path);
    $graph
      .selectAll('circle')
      .attr('cx', d => projection([d.longitude, d.latitude])[0])
      .attr('cy', d => projection([d.longitude, d.latitude])[1]);
  }
  var colors = [
    '#cab2d6',
    '#c19898',
    '#b2df8a',
    '#6a3d9a',
    '#33a02c',
    '#fb9a99',
    '#fdbf6f',
    '#1d5464',
    '#207e82',
    '#1f78b4',
    '#a6cee3',
    '#ff7f00',
    '#999ccc',
    '#d8d860'
  ];
  var index = 0;

  function getfuels(data) {
    console.log(data);
    data.forEach(ele => {
      var name = ele.fuel1;
      if (name) {
        if (!fuels.hasOwnProperty(name)) {
          fuels[name] = colors[index++];
        }
      }
      var country = ele.country;
      if (country) {
        if (!countries.hasOwnProperty(country)) {
          countries[country] = '';
        }
      }
      var year = ele.commissioning_year.split('-')[0];
      if (year) {
        if (!years.hasOwnProperty(year)) {
          years[year] = '';
        }
      }
    });
    console.log(years);

    var legend = document.getElementById('legend');
    // var list = document.getElementById('fuel1');
    Object.keys(fuels)
      .sort()
      .forEach(ele => {
        // var newEle = document.createElement('option');
        // newEle.innerHTML = ele;
        // newEle.setAttribute('value', ele);
        // list.appendChild(newEle);

        var leg = document.createElement('span');
        leg.innerHTML = ele;
        leg.style.background = fuels[ele];
        leg.setAttribute('value', ele);
        legend.appendChild(leg);
      });

    var list2 = document.getElementById('country');
    Object.keys(countries)
      .sort()
      .forEach(ele => {
        var newEle = document.createElement('option');
        newEle.innerHTML = ele;
        newEle.setAttribute('value', ele);
        list2.appendChild(newEle);
      });

    // var list3 = document.getElementById('commision_year');
    // Object.keys(years)
    // 	.sort()
    // 	.forEach(ele => {
    // 		var newEle = document.createElement('option');
    // 		newEle.innerHTML = ele;
    // 		newEle.setAttribute('value', ele);
    // 		list3.appendChild(newEle);
    // 	});
  }

  const tooltip = d3
    .select('#chart')
    .append('div')
    .classed('tooltip', true)
    .style('opacity', 0);

  function hideCircles(type, value) {
    // if (value == 'all') {
    //   $graph.selectAll('circle').attr('class', '');
    // } else {
    //   $graph.selectAll('circle').attr('class', function (d) {
    //     if (d[type] != value) {
    //       return 'hide';
    //     } else {
    //       return;
    //     }
    //   });
    // }
    filter[type] = value;
    hideCriclesByFilter();
  }

  function hideCriclesByFilter() {
    // console.log(filter);
    $graph.selectAll('circle').attr('class', function(d) {
      var _fuel = true,
        _year = true,
        _country = true;
      if (filter.year != 'all') {
        if (
          d.commissioning_year.split('-')[0] > filter.year ||
          d.commissioning_year == ''
        ) {
          _year = false;
        }
      }
      if (filter.fuel != 'all') {
        if (d.fuel1 != filter.fuel) {
          _fuel = false;
        }
      }
      if (filter.country != 'all') {
        if (d.country != filter.country) {
          _country = false;
        }
      }
      if (_fuel && _year && _country) {
        return '';
      } else {
        return 'hide';
      }
    });
  }

  function hideYearCircles(value) {
    if (value < 1477) {
      return;
    } else {
      filter.year = value;
    }
    hideCriclesByFilter();
  }

  function makeSlider() {
    let svg = d3
      .select('#slider')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 50)
      .attr('transform', 'translate(-10,0)');
    var tooltip = d3
      .select('#slider')
      .append('div')
      .attr('id', 'slidertip')
      .classed('tooltip', true)
      .style('opacity', 0);
    var x = d3
      .scaleLinear()
      .domain([1900, d3.max(Object.keys(years))])
      .range([0, data.width])
      .clamp(true);

    var slider = svg
      .append('g')
      .attr('class', 'slider')
      .attr('transform', 'translate(10' + ',' + 20 + ')');

    slider
      .append('line')
      .attr('class', 'track')
      .attr('x1', x.range()[0])
      .attr('x2', x.range()[1])
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr('class', 'track-inset')
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr('class', 'track-overlay')
      .call(
        d3
          .drag()
          .on('start.interrupt', function() {
            slider.interrupt();
          })
          .on('start drag', function() {
            hue(x.invert(d3.event.x));
          })
      );

    slider
      .insert('g', '.track-overlay')
      .attr('class', 'ticks')
      .attr('transform', 'translate(0,' + 18 + ')')
      .selectAll('text')
      .data(x.ticks(30))
      .enter()
      .append('text')
      .attr('x', x)
      .attr('text-anchor', 'middle')
      .text(function(d) {
        return d;
      });

    var handle = slider
      .insert('circle', '.track-overlay')
      .attr('class', 'handle')
      .attr('r', 9);

    slider
      .transition()
      .duration(750)
      .tween('hue', function() {
        var i = d3.interpolate(0, 70);
        return function(t) {
          hue(i(t));
        };
      });

    function hue(h) {
      handle.attr('cx', x(h));
      // console.log(Math.floor(h));
      hideYearCircles(Math.floor(h));
    }
  }

  function zoomed() {
    $graph
      .selectAll('path')
      .attr(
        'transform',
        'translate(' +
          d3.event.transform.x +
          ',' +
          d3.event.transform.y +
          ') scale(' +
          d3.event.transform.k +
          ')'
      );
    $graph
      .selectAll('circle')
      .attr(
        'transform',
        'translate(' +
          d3.event.transform.x +
          ',' +
          d3.event.transform.y +
          ') scale(' +
          d3.event.transform.k +
          ')'
      );
  }
  loadJson(data.json)
    .then(map_data => {
      path = d3.geoPath().projection(projection);
      renderPath(map_data);
      loadData(data.csv)
        .then(parsed_data => {
          getfuels(parsed_data);
          makeSlider();
          renderPoints(parsed_data);

          document.getElementById('legend').addEventListener(
            'click',
            function() {
              d3.selectAll('#legend span').classed('choosing',false);
              var target = event.target;
              if (target.tagName === 'SPAN') {
                var value = target.getAttribute('value');
                target.classList.add('choosing');
                if (value) {
                  hideCircles('fuel', value);
                }
              }
            },
            false
          );
          document.getElementById('country').addEventListener(
            'change',
            function() {
              hideCircles('country', this.value);
            },
            false
          );

          document.getElementById('allYear').addEventListener(
            'click',
            function() {
              hideCircles('year', 'all');
            },
            false
          );
          var mapZoom = d3.zoom().on('zoom', zoomed);
          $graph.call(mapZoom);

          //drag
          var drag = d3.drag().on('drag', dragging);
          $graph.select('g').call(drag);
        })
        .catch(error => {
          console.log(error);
        });
    })
    .catch(error => {
      console.log(error);
    });
})(template);
