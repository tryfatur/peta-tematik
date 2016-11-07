L.mapbox.accessToken = 'pk.eyJ1IjoidHJ5ZmF0dXIiLCJhIjoiY2lxdDJ5d3R1MDAydmZybmh3a3VtcmFvMiJ9.lL9RoXOtTscOHiSvOCrL-Q';
var map              = L.mapbox.map('map').setView([-6.909620, 107.634553], 13);
var info             = L.control();
var datasource       = L.control();
var legend           = L.control({position: 'bottomright'});
var geojson;

var globalStyle = { weight: 1, opacity: 1, color: 'white', dashArray: '3', fillOpacity: 0.9 };

var kategori = [
	{ "text": "Kepadatan Penduduk", "value": "density" },
	{ "text": "Kepadatan Penduduk Pria", "value": "densityMale" },
	{ "text": "Kepadatan Penduduk Wanita", "value": "densityFemale" },
];

var tahun = [
	{ "text": "2016", "value": "2016" },
	{ "text": "2015", "value": "2015" },
	{ "text": "2014", "value": "2014" },
	{ "text": "2013", "value": "2013" },
	{ "text": "2012", "value": "2012" },
	{ "text": "2011", "value": "2011" },
	{ "text": "2010", "value": "2010" },
	{ "text": "2009", "value": "2009" },
	{ "text": "2008", "value": "2008" }
];

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=' + L.mapbox.accessToken).addTo(map);

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
	this._div.innerHTML = '<b>Kategori: </b><select id="kategori"></select> <b>Tahun: </b><select id="tahun"></select>';

	return this._div;
};

datasource.addTo(map);

var grades = {
	"general": [0, 5000, 10000, 15000, 20000, 25000, 30000, 35000],
	"gender" : [0, 3000, 6000, 9000, 12000, 15000, 18000, 21000]
};

legend.onAdd = function (map) {
	var divLegend = L.DomUtil.create('div', 'info legend');

	// loop through our density intervals and generate a label with a colored square for each interval
	$('#kategori').change(function () {
		if (this.value == 'densityMale') {
			for (var i = 0; i < grades.gender.length; i++) {
				divLegend.innerHTML +=
					'<i style="background:' + getColorBlue(grades.gender[i] + 1) + '"></i> ' +
					grades.gender[i] + (grades.gender[i + 1] ? '&ndash;' + grades.gender[i + 1] + '<br>' : '+');
			}
		}else if (this.value == 'densityFemale') {
			for (var i = 0; i < grades.gender.length; i++) {
				divLegend.innerHTML +=
					'<i style="background:' + getColorPink(grades.gender[i] + 1) + '"></i> ' +
					grades.gender[i] + (grades.gender[i + 1] ? '&ndash;' + grades.gender[i + 1] + '<br>' : '+');
			}
		}else{
			for (var i = 0; i < grades.general.length; i++) {
				divLegend.innerHTML +=
					'<i style="background:' + getColor(grades.general[i] + 1) + '"></i> ' +
					grades.general[i] + (grades.general[i + 1] ? '&ndash;' + grades.general[i + 1] + '<br>' : '+');
			}
		}
	});
	return divLegend;
};

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

function getColorPink(d) {
	return d > 21000 ? '#99000d' :
		   d > 18000 ? '#cb181d' :
		   d > 15000 ? '#ef3b2c' :
		   d > 12000 ? '#fb6a4a' :
		   d > 9000  ? '#fc9272' :
		   d > 6000  ? '#fcbba1' :
		   d > 3000  ? '#fee0d2' :
					   '#fff5f0';
}

function getColorBlue(d) {
	return d > 21000 ? '#084594' :
		   d > 18000 ? '#2171b5' :
		   d > 15000 ? '#4292c6' :
		   d > 12000 ? '#6baed6' :
		   d > 9000  ? '#9ecae1' :
		   d > 6000  ? '#c6dbef' :
		   d > 3000  ? '#deebf7' :
					   '#f7fbff';
}

function style(feature) {
	globalStyle.fillColor = getColor(feature.properties.pdt_2016);
	
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
	var kecamatan = e.target.feature.properties.url;

	$.getJSON('src/json/data-agregasi.json', function (result) {
		var resultLength = result.length;
		var kelurahan = '';
		for (var i = 0 ; i < resultLength; i++) {
			if (result[i].url == kecamatan) {
				dataStatistik(result[i]);

				$('#luasWilayah').text(': ' + result[i].luas_wilayah + ' Km2');
				$('#kawasan').text(': ' + result[i].kawasan);
				$('#populasi').text(': ' + result[i].pop_2016);
				$('#jumlahSD').text(': ' + result[i].jml_sd);
				$('#jumlahSMP').text(': ' + result[i].jml_smp);
				$('#jumlahSMA').text(': ' + result[i].jml_sma);
				$('#jumlahSMK').text(': ' + result[i].jml_smk);
				$('#jumlahKeaksaraan').text(': ' + result[i].jml_keaksaraan);
				$('#usiaSD').text(': ' + result[i].umur_7_12);
				$('#usiaSMP').text(': ' + result[i].umur_13_15);
				$('#usiaSMA').text(': ' + result[i].umur_16_18);
				$('#jumlahPtkSD').text(': ' + result[i].jml_ptk_sd);
				$('#jumlahPtkSMP').text(': ' + result[i].jml_ptk_smp);
				$('#jumlahPtkSMA').text(': ' + result[i].jml_ptk_sma);
				$('#jumlahPtkSMK').text(': ' + result[i].jml_ptk_smk);
				$('#jumlahPtkKeaksaraan').text(': ' + result[i].jml_ptk_keaksaraan);
				
				/*var kelurahanLength = result[i].kelurahan.length;
				for(var j = 0; j < kelurahanLength; j++){
					kelurahan += result[i].kelurahan[j] + ', ';
				}*/
				$('#kelurahan').text(': ' + kelurahan);

				console.log(result[i]);
			};
		}
	});

	$('#statsModal').modal('show'); 
	e.target.getBounds();
}

//Highchart Statistics
function dataStatistik(data) {
	$(function () {
		$('#statistik').highcharts({
			chart: {
				type: 'line',
				width: 890,
				style: { fontFamily: 'PT Sans'}
			},
			title: {
				text: 'Data Kependudukan di Kecamatan ' + data.kecamatan + ' Tahun 2008 - 2016'
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
				categories: ['2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'],
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
				name: 'Jumlah Populasi',
				data: [
					data.pop_2008,
					data.pop_2009, 
					data.pop_2010, 
					data.pop_2011, 
					data.pop_2012, 
					data.pop_2013, 
					data.pop_2014, 
					data.pop_2015,
					data.pop_2016
				]
			},
			{
				name: 'Jumlah Kepadatan Penduduk (km2)',
				data: [
					data.pdt_2008, 
					data.pdt_2009, 
					data.pdt_2010, 
					data.pdt_2011, 
					data.pdt_2012, 
					data.pdt_2013, 
					data.pdt_2014, 
					data.pdt_2015,
					data.pdt_2016
				]
			},
			{
				name: 'Jumlah Populasi Pria',
				data: [
					data.pop_pria_2008, 
					data.pop_pria_2009, 
					data.pop_pria_2010, 
					data.pop_pria_2011, 
					data.pop_pria_2012, 
					data.pop_pria_2013, 
					data.pop_pria_2014, 
					data.pop_pria_2015,
					data.pop_pria_2016
				],
				visible: false
			},
			{
				name: 'Jumlah Kepadatan Penduduk Pria (km2)',
				data: [
					data.pdt_pria_2008, 
					data.pdt_pria_2009, 
					data.pdt_pria_2010, 
					data.pdt_pria_2011, 
					data.pdt_pria_2012, 
					data.pdt_pria_2013, 
					data.pdt_pria_2014, 
					data.pdt_pria_2015,
					data.pdt_pria_2016
				],
				visible: false
			},
			{
				name: 'Jumlah Populasi Wanita',
				data: [
					data.pop_wanita_2008,
					data.pop_wanita_2009,
					data.pop_wanita_2010,
					data.pop_wanita_2011,
					data.pop_wanita_2012,
					data.pop_wanita_2013,
					data.pop_wanita_2014,
					data.pop_wanita_2015,
					data.pop_wanita_2016
				],
				visible: false
			},
			{
				name: 'Jumlah Kepadatan Penduduk Wanita (km2)',
				data: [
					data.pdt_wanita_2009, 
					data.pdt_wanita_2009, 
					data.pdt_wanita_2010, 
					data.pdt_wanita_2011, 
					data.pdt_wanita_2012, 
					data.pdt_wanita_2013, 
					data.pdt_wanita_2014, 
					data.pdt_wanita_2015,
					data.pdt_wanita_2016
				],
				visible: false
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
$('#kategori').append('<option value="">-- Pilih Kategori --</option>');
$.each(kategori, function (i) {
	$('#kategori').append(
		'<option value="'+ kategori[i].value +'">'+ kategori[i].text +'</option>'
	);
});

// Restyle depends on data
var dataKategori;
$('#tahun').append('<option value="">-- Pilih Kategori --</option>');
$('#kategori').change(function () {
	dataKategori = this.value;

	$('#tahun').empty();
	$('#tahun').append('<option value="">-- Pilih Tahun --</option>');
	$.each(tahun, function (i) {
		$('#tahun').append(
			'<option value="'+ tahun[i].value +'">'+ tahun[i].text +'</option>'
		);
	});
});

$("#tahun").change(function () {
	switch(this.value){
		case "2016": 
			if (dataKategori == 'densityMale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorBlue(f.properties.pdt_pria_2016) }
				});
			}else if (dataKategori == 'densityFemale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorPink(f.properties.pdt_wanita_2016) }
				});
			}else{
				geojson.setStyle(function style(f) {
					return { fillColor: getColor(f.properties.pdt_2016) }
				});
			}
		break;

		case "2015": 
			if (dataKategori == 'densityMale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorBlue(f.properties.pdt_pria_2015) }
				});
			}else if (dataKategori == 'densityFemale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorPink(f.properties.pdt_wanita_2015) }
				});
			}else{
				geojson.setStyle(function style(f) {
					return { fillColor: getColor(f.properties.pdt_2015) }
				});
			}
		break;

		case "2014": 
			if (dataKategori == 'densityMale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorBlue(f.properties.pdt_pria_2014) }
				});
			}else if (dataKategori == 'densityFemale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorPink(f.properties.pdt_wanita_2014) }
				});
			}else{
				geojson.setStyle(function style(f) {
					return { fillColor: getColor(f.properties.pdt_2014) }
				});
			}
		break;

		case "2013": 
			if (dataKategori == 'densityMale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorBlue(f.properties.pdt_pria_2013) }
				});
			}else if (dataKategori == 'densityFemale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorPink(f.properties.pdt_wanita_2013) }
				});
			}else{
				geojson.setStyle(function style(f) {
					return { fillColor: getColor(f.properties.pdt_2013) }
				});
			}
		break;

		case "2012": 
			if (dataKategori == 'densityMale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorBlue(f.properties.pdt_pria_2012) }
				});
			}else if (dataKategori == 'densityFemale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorPink(f.properties.pdt_wanita_2012) }
				});
			}else{
				geojson.setStyle(function style(f) {
					return { fillColor: getColor(f.properties.pdt_2012) }
				});
			}
		break;

		case "2011": 
			if (dataKategori == 'densityMale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorBlue(f.properties.pdt_pria_2011) }
				});
			}else if (dataKategori == 'densityFemale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorPink(f.properties.pdt_wanita_2011) }
				});
			}else{
				geojson.setStyle(function style(f) {
					return { fillColor: getColor(f.properties.pdt_2011) }
				});
			}
		break;

		case "2010": 
			if (dataKategori == 'densityMale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorBlue(f.properties.pdt_pria_2010) }
				});
			}else if (dataKategori == 'densityFemale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorPink(f.properties.pdt_wanita_2010) }
				});
			}else{
				geojson.setStyle(function style(f) {
					return { fillColor: getColor(f.properties.pdt_2010) }
				});
			}
		break;

		case "2009": 
			if (dataKategori == 'densityMale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorBlue(f.properties.pdt_pria_2009) }
				});
			}else if (dataKategori == 'densityFemale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorPink(f.properties.pdt_wanita_2009) }
				});
			}else{
				geojson.setStyle(function style(f) {
					return { fillColor: getColor(f.properties.pdt_2009) }
				});
			}
		break;

		case "2008": 
			if (dataKategori == 'densityMale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorBlue(f.properties.pdt_pria_2008) }
				});
			}else if (dataKategori == 'densityFemale') {
				geojson.setStyle(function style(f) {
					return { fillColor: getColorPink(f.properties.pdt_wanita_2008) }
				});
			}else{
				geojson.setStyle(function style(f) {
					return { fillColor: getColor(f.properties.pdt_2008) }
				});
			}
		break;
	};
});

map.attributionControl.addAttribution('Data Kependudukan &copy; <a href="http://disdukcapil.bandung.go.id/">Dinas Kependudukan dan Pencatatan Sipil</a>');
map.attributionControl.addAttribution('<a href="http://portal.bandung.go.id/" target="_blank">Tim Open Data Kota Bandung</a> &copy 2016.');