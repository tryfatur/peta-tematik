L.mapbox.accessToken = 'pk.eyJ1IjoidHJ5ZmF0dXIiLCJhIjoiY2lxdDJ5d3R1MDAydmZybmh3a3VtcmFvMiJ9.lL9RoXOtTscOHiSvOCrL-Q';
var map              = L.mapbox.map('map').setView([-6.896462, 107.609290], 12);
var info             = L.control();
var statBox          = L.control({'position':'bottomleft'});
var geojson;

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	id: 'mapbox.light'
}).addTo(map);

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	this.update();
	return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
	this._div.innerHTML = '<h4>Tingkat Kepadatan Populasi Kota Bandung Tahun 2015</h4>' +  (props ?
		'<b>' + props._kecamatan + '</b><br />' + props._kepadatan_2009 + ' jiwa / km<sup>2</sup>' : 'Pilih Kecamatan');
};

/*statBox.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'statistik');
	return this._div;
}

statBox.addTo(map);*/
info.addTo(map);

function getColor(d) {
	return d > 35000 ? '#8C2D04' :
		   d > 30000 ? '#CC4C02' :
		   d > 25000 ? '#EC7014' :
		   d > 20000 ? '#FE9929' :
		   d > 15000 ? '#FEC44F' :
		   d > 10000 ? '#FEE391' :
		   d > 5000  ? '#FFF7BC' :
					   '#FFFFE5';
}

function style(feature) {
	return {
		fillColor: getColor(feature.properties._kepadatan_2009),
		weight: 1,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.9
	};
}

function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.9
	});

	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);
}

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	var kecamatan = e.target.feature.properties._url;

	$.getJSON('src/json/data.json', function (result) {
		var resultLength = result.length;
		for (var i = 0 ; i < resultLength; i++) {
			if (result[i].url == kecamatan) {
				dataStatistik(result[i]);
			};
		}
	});

	map.fitBounds(e.target.getBounds());
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
			legend: {
				enabled: false
			},
			series: [{
				name: 'Jumlah Penduduk',
				data: [data.tahun_2009, data.tahun_2010, data.tahun_2011, data.tahun_2012, data.tahun_2013, data.tahun_2014, data.tahun_2015]
			}]
		});
	});
}

geojson = L.geoJson(baseMap, {
	style: style,
	onEachFeature: function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: openModal
		});
	}
}).addTo(map);

var legend = L.control({position: 'bottomright'});

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

map.attributionControl.addAttribution('Data Populasi &copy; <a href="http://data.bandung.go.id/">Portal Data Bandung</a>');
map.attributionControl.addAttribution('<a href="https://github.com/tryfatur" target="_blank">Try Fathur Rachman</a> &copy 2016;');