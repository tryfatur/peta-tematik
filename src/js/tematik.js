L.mapbox.accessToken = 'pk.eyJ1IjoidHJ5ZmF0dXIiLCJhIjoiY2lxdDJ5d3R1MDAydmZybmh3a3VtcmFvMiJ9.lL9RoXOtTscOHiSvOCrL-Q';
var map              = L.mapbox.map('map').setView([-6.909620, 107.634553], 13);
var info             = L.control();
var datasource       = L.control();
var legend           = L.control({position: 'bottomright'});
var geojson;

var globalStyle = { weight: 1, opacity: 1, color: 'white', dashArray: '3', fillOpacity: 0.9 };

var data = [
	{ "text": "Jumlah Kepadatan Penduduk Tahun 2015", "value": "2015" },
	{ "text": "Jumlah Kepadatan Penduduk Tahun 2014", "value": "2014" },
	{ "text": "Jumlah Kepadatan Penduduk Tahun 2013", "value": "2013" },
	{ "text": "Jumlah Kepadatan Penduduk Tahun 2012", "value": "2012" },
	{ "text": "Jumlah Kepadatan Penduduk Tahun 2010", "value": "2010" },
	{ "text": "Jumlah Kepadatan Penduduk Tahun 2009", "value": "2009" }
];

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=' + L.mapbox.accessToken).addTo(map);

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	this.update();
	return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
	this._div.innerHTML = '<h4><b>Peta Tematik Kepadatan Kota Bandung</b></h4>' +  (props ?
		'<b>Kecamatan: ' + props._kecamatan + '</b>' : 'Pilih Kecamatan');
};

info.addTo(map);

datasource.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	this._div.innerHTML = '<b>Sumber Data: </b><select id="dataSource"></select>';

	return this._div;
};

datasource.addTo(map);

legend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 5000, 10000, 15000, 20000, 25000, 30000, 35000],
		labels = [];

	// loop through our density intervals and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}

	return div;
};

legend.addTo(map);

function getColor(d) {
	return d > 35000 ? '#b10026' :
		   d > 30000 ? '#e31a1c' :
		   d > 25000 ? '#fc4e2a' :
		   d > 20000 ? '#fd8d3c' :
		   d > 15000 ? '#feb24c' :
		   d > 10000 ? '#fed976' :
		   d > 5000  ? '#ffeda0' :
					   '#ffffcc';
}

function style(feature) {
	globalStyle.fillColor = getColor(feature.properties._kepadatan_2015);
	
	return globalStyle;
}

function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '3',
		fillOpacity: 0.9
	});

	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);
}

function resetHighlight(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 1,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.9
	});

	info.update();
}

function openModal(e) {
	var kecamatan = e.target.feature.properties._url;

	$.getJSON('src/json/data.json', function (result) {
		var resultLength = result.length;
		for (var i = 0 ; i < resultLength; i++) {
			if (result[i].url == kecamatan) {
				dataStatistik(result[i]);
			};
		}
	});
	$('#statsModal').modal('show'); 
	e.target.getBounds();
}

function dataStatistik(data) {
	$(function () {
		$('#statistik').highcharts({
			chart: {
				type: 'line',
				width: 890,
				style: { fontFamily: 'PT Sans'}
			},
			title: {
				text: 'Jumlah Penduduk di Kecamatan ' + data.kecamatan + ' Tahun 2009 - 2015'
			},
			subtitle: {
				text: 'Sumber: Portal Data Bandung'
			},
			plotOptions: {
				line: {
					dataLabels: {
						enabled: true
					},
					enableMouseTracking: false
				}
			},
			xAxis: {
				categories: ['2009', '2010', '2011', '2012', '2013', '2014', '2015'],
				title: {
					text: 'Tahun'
				}
			},
			yAxis: {
				min: 0,
				title: {
					text: 'Jumlah Penduduk'
				}
			},
			series: [{
				name: 'Jumlah Penduduk',
				data: [data.tahun_2009, data.tahun_2010, data.tahun_2011, data.tahun_2012, data.tahun_2013, data.tahun_2014, data.tahun_2015],
				color: '#b10026'
			},
			{
				name: 'Jumlah Kepadatan Penduduk (km2)',
				data: [data.kepadatan_2009, data.kepadatan_2010, data.kepadatan_2011, data.kepadatan_2012, data.kepadatan_2013, data.kepadatan_2014, data.kepadatan_2015],
				color: '#fc4e2a'
			}]
		});
	});
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: openModal
	});
}

geojson = L.geoJson(baseMap, { style: style, onEachFeature: onEachFeature });

geojson.addTo(map);

// Send data options
$.each(data, function (i) {
	$('#dataSource').append(
		'<option value="'+ data[i].value +'">'+ data[i].text +'</option>'
	);
});

// Restyle depends on data
$("#dataSource").change(function () {
	switch(this.value){
		case "2015": geojson.setStyle(function style(feature) {
			return { fillColor: getColor(feature.properties._kepadatan_2015) }
		});
		break;

		case "2014" : geojson.setStyle(function style(feature) {
			return { fillColor: getColor(feature.properties._kepadatan_2014) }
		});
		break;

		case "2013" : geojson.setStyle(function style(feature) {
			return { fillColor: getColor(feature.properties._kepadatan_2013) }
		});
		break;

		case "2012" : geojson.setStyle(function style(feature) {
			return { fillColor: getColor(feature.properties._kepadatan_2012) }
		});
		break;

		case "2010" : geojson.setStyle(function style(feature) {
			return { fillColor: getColor(feature.properties._kepadatan_2010) }
		});
		break;

		case "2009" : geojson.setStyle(function style(feature) {
			return { fillColor: getColor(feature.properties._kepadatan_2009) }
		});
		break;
	};
});

map.attributionControl.addAttribution('Data Populasi &copy; <a href="http://data.bandung.go.id/">Portal Data Bandung</a>');
map.attributionControl.addAttribution('<a href="https://github.com/tryfatur" target="_blank">Try Fathur Rachman</a> &copy 2016;');