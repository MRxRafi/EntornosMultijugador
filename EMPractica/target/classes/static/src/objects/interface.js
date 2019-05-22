//Recibe como parámetro un texto  
//Modifica su color al pasar el ratón por encima
function mouseOver(text) {
	text.fill = "rgb(255,0,255)";
};

// Recibe como parámetro un texto
// Modifica su color al apartar el ratón
function mouseOut(text) {
	text.fill = "rgb(255,255,255)";
};

// Crea un recuadro en el que introducir texto
// Recibe como parámetros el color de el recuadro, el color del texto, el texto
// que aparece encima de la barra y el texto del botón
function inputText(color, colorText, pText, sText) {

	this.iDiv = document.getElementById("textBlock");
	this.iDiv.style.visibility = "visible"
	this.iDiv.style.backgroundColor = color;

	this.text = document.getElementById("p1");
	this.text.style.color = colorText;
	this.text.innerHTML = pText;

	this.input = document.getElementById("inputText");

	this.submitButton = document.getElementById("submitButton");
	this.submitButton.value = sText;

	this.hide = function() {
		this.input.value = "";
		this.iDiv.style.visibility = "hidden";
	}
};

