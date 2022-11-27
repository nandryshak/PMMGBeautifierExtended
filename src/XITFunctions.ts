import {createTextSpan, createMaterialElement, createFinancialTextBox, findCorrespondingPlanet, createLink, createTable, createSelectOption, downloadFile} from "./util";
import {TextColors} from "./Style";
import {MaterialNames} from "./GameProperties";
import {getGroupBurn} from "./BackgroundRunner";
import {Style, WithStyles} from "./Style";
import {Selector} from "./Selector";

export const XITPreFunctions = {
	"INV": FIOInv_pre,
	"DISCORD": Discord_pre,
	"SHEETS": Sheets_pre,
	"PROSPERITY": Prosperity_pre,
	"PRUN": PRuN_pre,
	"SHEETTABLE": SheetTable_pre,
	"FIN": Fin_pre,
	"CHAT": Chat_pre,
	"BURN": EnhancedBurn_pre,
	"SETTINGS": Settings_pre,
	"CONTRACTS": Contracts_pre,
	"REPAIRS": Repairs_pre,
	"CALCULATOR": Calculator_pre,
	"CALC": Calculator_pre,
	"START": Start_pre,
	"DEBUG": Debug_pre
}

export const XITBufferTitles = {
	"INV": "FIO INVENTORY",
	"DISCORD": "DISCORD SERVER",
	"SHEETS": "GOOGLE SHEETS",
	"PROSPERITY": "PROSPERITY",
	"PRUN": "PRUN-CEPTION",
	"SHEETTABLE": "GOOGLE SHEETS TABLE",
	"FIN": "FINANCIAL OVERVIEW",
	"CHAT": "CHAT",
	"BURN": "ENHANCED BURN",
	"SETTINGS": "PMMG SETTINGS",
	"CONTRACTS": "PENDING CONTRACTS",
	"REPAIRS": "REPAIRS",
	"CALC": "CALCULATOR",
	"CALCULATOR": "CALCULATOR",
	"START": "STARTING WITH PMMG",
	"DEBUG": "DEBUG"
}

const DiscordServers = {
	"UFO": ["855488309802172469", "855489711635431475"],
	"FIOC": ["807992640247300116", "808451512351195166"],
	"AHI": ["704907707634941982", "797157877324185650"],
	"PCT": ["667551433503014924", "667551433503014927"]
}

/**
 * Make an XML HTTP Request to a service and fill in the tile with that information
 * @param tile - The tile frame on which to show the output
 * @param parameters - The parameters from the XIT bufferDepth
 * @param callbackFunction - The function to call once the request is successful
 * @param url - The URL to be accessed
 * @param requestType - The type of HttpRequest (GET, POST, etc)
 * @param header - A dictionary with 2 key-value pairs "HeaderName": name of header, "HeaderValue": value of header
 * @param content - The content to send in the HttpRequest
 */
function XITWebRequest(tile, parameters, callbackFunction, url, requestType: string = "GET", header, content)
{
	var xhr = new XMLHttpRequest();
	xhr.ontimeout = function () {
		tile.textContent = "Error! Data Could Not Be Loaded! Timed Out!";
	};
	
	xhr.onreadystatechange = function()
    {
	
	    if(xhr.readyState == XMLHttpRequest.DONE)
	    {
			callbackFunction(tile, parameters, xhr.responseText);
		}
		return;
    };
	xhr.timeout = 10000;
	xhr.open(requestType, url, true);
	if(header){xhr.setRequestHeader(header[0], header[1]);}
	if(content)
	{
		xhr.send(content);
	}
	else
	{
		xhr.send(null);
	}
	return;
}

function clearChildren(elem)
{
	elem.textContent = "";
	while(elem.children[0])
	{
		elem.removeChild(elem.children[0]);
	}
	return;
}

export function Settings_pre(tile, parameters, result, fullBurn, burnSettings, modules)
{
	clearChildren(tile);
	const warningDiv = document.createElement("div");
	tile.appendChild(warningDiv);
	warningDiv.style.marginTop = "4px";
	warningDiv.appendChild(createTextSpan("Settings changes require a refresh to take effect."));
	
	const authenticationHeader = document.createElement('h3');
    authenticationHeader.appendChild(document.createTextNode("Authentication Settings"));
	authenticationHeader.classList.add(...Style.SidebarSectionHead);
	tile.appendChild(authenticationHeader);
	const usernameDiv = document.createElement("div");
	const usernameLabel = createTextSpan("FIO Username: ");
	const usernameInput = document.createElement("input");
	usernameInput.value = result["PMMGExtended"]["username"] || "";
	usernameInput.addEventListener("input", function(){
		result["PMMGExtended"]["username"] = !usernameInput.value || usernameInput.value == "" ? undefined : usernameInput.value;
		setSettings(result);
	});
	usernameInput.classList.add("input-text");
	usernameDiv.appendChild(usernameLabel);
	usernameDiv.appendChild(usernameInput);
	tile.appendChild(usernameDiv);
	
	const apiDiv = document.createElement("div");
	const apiLabel = createTextSpan("FIO API Key: ");
	apiLabel.style.minWidth = "77px";
	apiLabel.style.display = "inline-block";
	const apiInput = document.createElement("input");
	apiInput.value = result["PMMGExtended"]["apikey"] || "";
	apiInput.addEventListener("input", function(){
		result["PMMGExtended"]["apikey"] = !apiInput.value || apiInput.value == "" ? undefined : apiInput.value;
		setSettings(result);
	});
	apiInput.classList.add("input-text");
	apiInput.type = "password";
	apiDiv.appendChild(apiLabel);
	apiDiv.appendChild(apiInput);
	tile.appendChild(apiDiv);
	
	const webDiv = document.createElement("div");
	const webLabel = createTextSpan("Web App ID: ");
	webLabel.style.minWidth = "77px";
	webLabel.style.display = "inline-block";
	const webInput = document.createElement("input");
	webInput.value = result["PMMGExtended"]["webappid"] || "";
	webInput.addEventListener("input", function(){
		result["PMMGExtended"]["webappid"] = !webInput.value || webInput.value == "" ? undefined : webInput.value;
		setSettings(result);
	});
	webInput.classList.add("input-text");
	webDiv.appendChild(webLabel);
	webDiv.appendChild(webInput);
	tile.appendChild(webDiv);
	
	const moduleSettingsHeader = document.createElement('h3');
    moduleSettingsHeader.appendChild(document.createTextNode("Module Settings"));
    moduleSettingsHeader.classList.add(...Style.SidebarSectionHead);
	tile.appendChild(moduleSettingsHeader);
	const content = document.createElement("div");
	content.classList.add(...Style.SidebarSectionContent);
    tile.appendChild(content);
	modules.forEach(mp => {
		// Div for the whole line
		const line = document.createElement('div');
		line.classList.add(...WithStyles(Style.SidebarLine, Style.FontsRegular));
		content.appendChild(line);

		// Left
		line.appendChild(createTextSpan(mp.name));
		content.appendChild(line);
		
		// Right
		const right = document.createElement("span");
        right.style.flexGrow = "1";
        right.style.textAlign = "right";
        line.appendChild(right);
		
	    if(result["PMMGExtended"]["disabled"] == undefined){result["PMMGExtended"]["disabled"] = [];}
        const toggle = makeToggleButton("On", "Off", () => {
			mp.enabled = !mp.enabled;
			if(result["PMMGExtended"]["disabled"].includes(mp.name))
			{
				if(mp.enabled){
					for(var i = 0; i < result["PMMGExtended"]["disabled"].length; i++)
					{
						if(result["PMMGExtended"]["disabled"][i] == mp.name)
						{
							result["PMMGExtended"]["disabled"].splice(i, 1);
							i--;
						}
					}
				} // Was just enabled, remove disabled label
			}
			else
			{
				if(!mp.enabled){result["PMMGExtended"]["disabled"].push(mp.name);}	// Was just disabled, add disabled label
			}
			setSettings(result);
		}, mp.enabled);
		if(result["PMMGExtended"]["disabled"].includes(mp.name))
		{
			toggle.setAttribute("data-state", "false");
			mp.enabled = false;
			toggle.classList.remove(...Style.ButtonSuccess);
			toggle.classList.add(...Style.ButtonPrimary);
			toggle.innerText = "Off";
		}
		right.appendChild(toggle);

		const cleanup = makePushButton("x", () => mp.module.cleanup(true));
		cleanup.style.marginRight = "8px";
		right.appendChild(cleanup);
		return;
	});
	
	const enhancedColorHeader = document.createElement('h3');
    enhancedColorHeader.appendChild(document.createTextNode("Color Scheme"));
    enhancedColorHeader.classList.add(...Style.SidebarSectionHead);
	tile.appendChild(enhancedColorHeader);
	
	const colorDiv = document.createElement("div");
	
	const colorLabel = createTextSpan("Color Scheme:");
	colorLabel.style.marginBottom = "4px";
	colorDiv.appendChild(colorLabel);
	
	const colorSelect = document.createElement("select");
	colorSelect.name = "colors-select";
	colorSelect.id = "colors-select";
	colorSelect.appendChild(createSelectOption("Enhanced", "enhanced"));
	colorSelect.appendChild(createSelectOption("Icons", "icons"));
	colorSelect.appendChild(createSelectOption("Default", "default"));
	colorSelect.classList.add("select");
	colorSelect.style.marginLeft = "4px";
	
	if(result["PMMGExtended"]["color_scheme"] == "enhanced" || !result["PMMGExtended"]["color_scheme"])
	{
		(colorSelect.children[0] as HTMLOptionElement).selected = true;
	}
	else if(result["PMMGExtended"]["color_scheme"] == "icons")
	{
		(colorSelect.children[1] as HTMLOptionElement).selected = true;
	}
	else
	{
		(colorSelect.children[2] as HTMLOptionElement).selected = true;
	}
	colorSelect.style.display = "inline-block";
	colorSelect.addEventListener("change", function(){
		result["PMMGExtended"]["color_scheme"] = colorSelect.selectedOptions[0].value || undefined;
		setSettings(result);
	});
	colorDiv.appendChild(colorSelect);
	tile.appendChild(colorDiv);
	
	const burnDiv = document.createElement("div");
	const burnLabel = document.createElement('h3');
	burnLabel.appendChild(createTextSpan("Burn Settings"));
	burnLabel.classList.add(...Style.SidebarSectionHead);
	burnLabel.style.marginBottom = "4px";
	burnDiv.appendChild(burnLabel);
	
	if(!result["PMMGExtended"]["burn_thresholds"]){result["PMMGExtended"]["burn_thresholds"] = [3, 7];}
	const setDiv = document.createElement("div");
	burnDiv.appendChild(setDiv);
	setDiv.style.display = "flex";
	const redDiv = document.createElement("div");
	setDiv.appendChild(redDiv);
	redDiv.appendChild(createTextSpan("Red Threshold: "));
	const redIn = document.createElement("input");
	redIn.type = "number";
	redIn.value = (result["PMMGExtended"]["burn_thresholds"] || [3])[0].toLocaleString(undefined, {maximumFractionDigits: 0});
	redDiv.appendChild(redIn);
	redIn.classList.add("input-text");
	redIn.style.width = "50px";
	redIn.addEventListener("input", function(){
		result["PMMGExtended"]["burn_thresholds"][0] = parseFloat(redIn.value);
		setSettings(result);
	});
	
	const yelDiv = document.createElement("div");
	setDiv.appendChild(yelDiv);
	yelDiv.appendChild(createTextSpan("Yellow Threshold: "));
	const yelIn = document.createElement("input");
	yelIn.type = "number";
	yelIn.value = (result["PMMGExtended"]["burn_thresholds"] || [3, 7])[1].toLocaleString(undefined, {maximumFractionDigits: 0});
	yelDiv.appendChild(yelIn);
	yelIn.classList.add("input-text");
	yelIn.style.width = "50px";
	yelIn.addEventListener("input", function(){
		result["PMMGExtended"]["burn_thresholds"][1] = parseFloat(yelIn.value);
		setSettings(result);
	});
	
	tile.appendChild(burnDiv);
	
	const screenUnpackHeader = document.createElement('h3');
    screenUnpackHeader.appendChild(document.createTextNode("Screen Unpack Exclusions"));
    screenUnpackHeader.classList.add(...Style.SidebarSectionHead);
	tile.appendChild(screenUnpackHeader);
	const notifDiv = document.createElement("div");
	tile.appendChild(notifDiv);
	notifDiv.appendChild(createTextSpan("List screen names separated by commas, no spaces."));
	const exclusionInput = document.createElement("input");
	exclusionInput.classList.add("input-text");
	exclusionInput.value = result["PMMGExtended"]["unpack_exceptions"] == undefined ? "" : result["PMMGExtended"]["unpack_exceptions"].join(",");
	exclusionInput.addEventListener("input", function(){
		result["PMMGExtended"]["unpack_exceptions"] = exclusionInput.value.split(",");
		setSettings(result);
	});
	
	tile.appendChild(exclusionInput);
	
	const hotkeyHeader = document.createElement('h3');
    hotkeyHeader.appendChild(document.createTextNode("Left Sidebar Buttons"));
    hotkeyHeader.classList.add(...Style.SidebarSectionHead);
	tile.appendChild(hotkeyHeader);
	const hotkeyInputDiv = document.createElement("div");
	tile.appendChild(hotkeyInputDiv);
	if(!result["PMMGExtended"]["sidebar"]){result["PMMGExtended"]["sidebar"] = [["BS", "BS"], ["CONT", "CONTS"], ["COM", "COM"], ["CORP", "CORP"], ["CXL", "CXL"], ["FIN", "FIN"], ["FLT", "FLT"], ["INV", "INV"], ["MAP", "MAP"], ["PROD", "PROD"], ["CMDS", "CMDS"], ["SET", "XIT SETTINGS"]];}
	result["PMMGExtended"]["sidebar"].forEach(hotkey => {
		const div = createInputPair(hotkey, result, hotkeyInputDiv);
		if(div != null){hotkeyInputDiv.appendChild(div);}
		return;
	});
	
	const addButton = makePushButton("+", function(){
		const div = createInputPair([[],[]], result, hotkeyInputDiv);
		if(div != null){hotkeyInputDiv.appendChild(div);}
	}, Style.ButtonSuccess);
	addButton.style.marginLeft = "4px";
	addButton.style.marginBottom = "4px";
	
	tile.appendChild(addButton);
	
	const importHeader = document.createElement('h3');
    importHeader.appendChild(document.createTextNode("Import/Export Settings"));
    importHeader.classList.add(...Style.SidebarSectionHead);
	tile.appendChild(importHeader);
	
	const importDiv = document.createElement("div");
	
	const importButton = document.createElement("button");
	importButton.textContent = "Import Settings";
	importButton.classList.add(...Style.Button);
	importButton.classList.add(...Style.ButtonPrimary);
	importButton.style.marginLeft = "4px";
	importButton.style.marginBottom = "4px";
	importDiv.appendChild(importButton);
	const importFileInput = document.createElement("input");
	importFileInput.type = "file";
	importFileInput.accept = ".json";
	importFileInput.style.display = "none";
	importDiv.appendChild(importFileInput);
	importButton.addEventListener("click", function() {
		importFileInput.click()
		return;
	});
	const errorTextBox = createTextSpan("Error Loading File!");
	errorTextBox.style.display = "none";
	importDiv.appendChild(errorTextBox);
	importFileInput.addEventListener("change", function() {
		if(!this.files){return;}
		const file = this.files[0];
		if(!file){return;}
		const reader = new FileReader();
		reader.onload = function(e){
			if(!e || !e.target){return;}
			try
			{
				const fileOutput = JSON.parse(e.target.result);
				console.log(fileOutput);
				const exclude = ["username", "apikey", "webappid"];	// Don't overwrite username, apikey, and webappid
				Object.keys(fileOutput).forEach(key => {
					if(!exclude.includes(key))
					{
						result["PMMGExtended"][key] = fileOutput[key];
					}
				});
				setSettings(result);
				errorTextBox.style.display = "none";
			} catch(ex)
			{
				console.log("PMMG: Error encountered processing file!");
				errorTextBox.style.display = "inline-block";
			}
			
		}
		reader.readAsText(file);
		return;
	});
	
	const exportButton = document.createElement("button");
	exportButton.textContent = "Export Settings";
	exportButton.classList.add(...Style.Button);
	exportButton.classList.add(...Style.ButtonPrimary);
	exportButton.style.marginLeft = "4px";
	exportButton.style.marginBottom = "4px";
	importDiv.appendChild(exportButton);
	
	exportButton.addEventListener("click", function(){
		const output = {};
		const exclude = ["username", "apikey", "webappid"];	// Don't export username, apikey, and webappid
		Object.keys(result["PMMGExtended"]).forEach(key => {
			if(!exclude.includes(key))
			{
				output[key] = result["PMMGExtended"][key];
			}
		});
		
		downloadFile(output, "pmmg-settings" + Date.now().toString() + ".json");
	});
	
	tile.appendChild(importDiv);
	
	return [parameters, fullBurn, burnSettings];
}
function setSettings(result)
{
	try
	{
		browser.storage.local.set(result);
	}
	catch(err)
	{
		chrome.storage.local.set(result, function(){
			console.log("PMMG: Configuration Saved.");
		});
	}
	return;
}
function createInputPair(hotkey, result, fullDiv)
{
	if(hotkey.length != 2){return null;}
	const div = document.createElement("div");
	const displayedValue = document.createElement("input");
	displayedValue.classList.add("input-text");
	displayedValue.style.display = "inline-block";
	div.appendChild(displayedValue);
	const command = document.createElement("input");
	command.classList.add("input-text");
	command.style.display = "inline-block";
	div.appendChild(command);
	const remove = makePushButton("X", function(){
		displayedValue.value = "";
		command.value = "";
		
		displayedValue.dispatchEvent(new Event("input"));
		(Array.from(div.children) as HTMLElement[]).forEach(elem => {div.removeChild(elem);return;});
	}, Style.ButtonDanger);
	remove.style.display = "inline-block";
	div.appendChild(remove);
	
	displayedValue.value = hotkey[0];
	command.value = hotkey[1];
	
	displayedValue.addEventListener("input", function(){
		var hotkeys = [] as string[][];
		(Array.from(fullDiv.children) as HTMLElement[]).forEach(option => {
			if(option.children[0] != undefined && option.children[1] != undefined && (option.children[0] as HTMLInputElement).value != "" && (option.children[0] as HTMLInputElement).value != undefined && (option.children[1] as HTMLInputElement).value != "" && (option.children[1] as HTMLInputElement).value != undefined)
			{
				hotkeys.push([(option.children[0] as HTMLInputElement).value, (option.children[1] as HTMLInputElement).value] as string[]);
			}
			return;
		});
		result["PMMGExtended"]["sidebar"] = hotkeys;
		setSettings(result);
	});
	
	command.addEventListener("input", function(){
		var hotkeys = [] as string[][];
		(Array.from(fullDiv.children) as HTMLElement[]).forEach(option => {
			if(option.children[0] != undefined && option.children[1] != undefined && (option.children[0] as HTMLInputElement).value != "" && (option.children[0] as HTMLInputElement).value != undefined && (option.children[1] as HTMLInputElement).value != "" && (option.children[1] as HTMLInputElement).value != undefined)
			{
				hotkeys.push([(option.children[0] as HTMLInputElement).value, (option.children[1] as HTMLInputElement).value] as string[]);
			}
			return;
		});
		result["PMMGExtended"]["sidebar"] = hotkeys;
		setSettings(result);
	});
	return div;
}

function makePushButton(text: string, f: () => void, style = Style.ButtonPrimary) {
    const button = document.createElement('button');
    button.classList.add(...Style.Button);
    button.classList.add(...style);
    button.onclick = f;
    button.innerText = text;
    return button;
}

function makeToggleButton(on: string, off: string, f: () => void, state: boolean = false) {
	const toggle = document.createElement('button');
	toggle.classList.add(...Style.Button);
	const setLook = (s: boolean) => {
	  toggle.innerText = s ? on : off;
	  // If state is switched on:
	  if (s) {
		toggle.classList.remove(...Style.ButtonPrimary);
		toggle.classList.add(...Style.ButtonSuccess);
	  } else {
		toggle.classList.remove(...Style.ButtonSuccess);
		toggle.classList.add(...Style.ButtonPrimary);
	  }
	};

	toggle.setAttribute("data-state", String(state));
	setLook(state);
	toggle.onclick = () => {
	  const newState = !(toggle.getAttribute("data-state") === "true");
	  toggle.setAttribute("data-state", String(newState));
	  setLook(newState);
	  f();
	};
	toggle.style.width = "40px";
	return toggle;
}

export function Start_pre(tile)
{
	clearChildren(tile);
	tile.style.fontSize = "12px";
	tile.style.paddingLeft = "2px";
	const welcome = createTextSpan("Thank you for using PMMG Extended!");
	welcome.classList.add("title");
	welcome.style.paddingLeft = "0";
	tile.appendChild(welcome);
	tile.appendChild(createTextSpan("This is a short tutorial on how to get the most out of the extension."));
	const websiteLinkDiv = document.createElement("div");
	websiteLinkDiv.style.paddingTop = "20px";
	tile.appendChild(websiteLinkDiv);
	websiteLinkDiv.appendChild(createTextSpan("Details on what PMMG offers can be found here: "));
	const websiteLink = document.createElement("a");
	websiteLink.href = "https://sites.google.com/view/pmmgextended/home?authuser=0";
	websiteLink.target = "_blank";
	websiteLink.style.display = "inline-block";
	websiteLink.classList.add("link");
	websiteLink.textContent = "PMMG Extended";
	websiteLinkDiv.appendChild(websiteLink);
	
	const settingsDiv = document.createElement("div");
	tile.appendChild(settingsDiv);
	settingsDiv.style.paddingTop = "20px";
	settingsDiv.appendChild(createTextSpan("Start by opening a new buffer and entering "));
	const settingsLink = createLink("XIT SETTINGS", "XIT SETTINGS");
	settingsLink.style.display = "inline-block";
	settingsDiv.appendChild(settingsLink);
	
	const fioDiv = document.createElement("div");
	tile.appendChild(fioDiv);
	fioDiv.style.paddingTop = "20px";
	fioDiv.appendChild(createTextSpan("FIO is a browser extension that gathers data from your game. PMMG Extended uses that data to display useful information. You can learn more about installing FIO here: "));
	const fioLink = document.createElement("a");
	fioLink.href = "https://fio.fnar.net/";
	fioLink.target = "_blank";
	fioLink.style.display = "inline-block";
	fioLink.classList.add("link");
	fioLink.textContent = "FIO Website";
	fioDiv.appendChild(fioLink);
	
	const fioDiv2 = document.createElement("div");
	tile.appendChild(fioDiv2);
	fioDiv2.style.paddingTop = "20px";
	fioDiv2.appendChild(createTextSpan("If you already have a FIO account, add your username and API Key to the text boxes on XIT SETTINGS. You can generate an API Key "));
	const fioLink2 = document.createElement("a");
	fioLink2.href = "https://fio.fnar.net/settings";
	fioLink2.target = "_blank";
	fioLink2.style.display = "inline-block";
	fioLink2.classList.add("link");
	fioLink2.textContent = "here.";
	fioDiv2.appendChild(fioLink2);
	
	const webAppDiv = document.createElement("div");
	tile.appendChild(webAppDiv);
	webAppDiv.style.paddingTop = "20px";
	webAppDiv.style.paddingBottom = "20px";
	webAppDiv.appendChild(createTextSpan("If your corporation has a web app (AHI, FOWL, KAWA), enter that in the Web App ID field."));
	
	tile.appendChild(createTextSpan("You can explore other settings to enable or disable features, change the color scheme, and customize the left sidebar. Contact PiBoy314 in game or on Discord if you have questions."));
	return;
}

export function Debug_pre(tile, parameters, result, fullBurn, burnSettings)
{
	clearChildren(tile);
	const downloadButtons = document.createElement("div");
	tile.appendChild(downloadButtons);
	downloadButtons.appendChild(createDownloadButton(result["PMMGExtended"], "Download Full Settings", "pmmg-settings" + Date.now().toString() + ".json"));
	downloadButtons.appendChild(createDownloadButton(fullBurn[result["PMMGExtended"]["username"]], "Download Burn", "pmmg-burn" + Date.now().toString() + ".json"));
	downloadButtons.appendChild(createDownloadButton(burnSettings, "Download Burn Settings", "pmmg-burn-settings" + Date.now().toString() + ".json"));
	const endpointLabel = document.createElement("div");
	endpointLabel.textContent = "Get FIO Endpoint (ex: /infrastructure/Proxion)";
	endpointLabel.style.display = "block";
	endpointLabel.style.marginLeft = "4px";
	downloadButtons.appendChild(endpointLabel);
	const endpointInput = document.createElement("input");
	endpointInput.classList.add("input-text");
	endpointInput.style.display = "block";
	downloadButtons.appendChild(endpointInput);
	const endpointButton = document.createElement("button");
	endpointButton.textContent = "Download FIO Endpoint";
	endpointButton.classList.add(...Style.Button);
	endpointButton.classList.add(...Style.ButtonPrimary);
	endpointButton.style.marginLeft = "4px";
	endpointButton.style.marginBottom = "4px";
	endpointButton.style.display = "block";
	endpointButton.addEventListener("click", function() {
		const url = "https://rest.fnar.net" + (endpointInput.value.charAt(0) == "/" ? "" : "/") + endpointInput.value;
	    XITWebRequest(tile, parameters, Debug_post, url, "GET", ["Authorization", result["PMMGExtended"]["apikey"]], null);
	});
	downloadButtons.appendChild(endpointButton);
	return parameters;
}
export function Debug_post(tile, parameters, jsondata)
{
	try
	{
		console.log(JSON.parse(jsondata));
	} catch(ex){}
	downloadFile(jsondata, "fio-endpoint" + Date.now().toString() + ".json", false);
	return [tile, parameters];
}
export function createDownloadButton(data, buttonName, fileName)
{
	const downloadButton = document.createElement("button");
	downloadButton.textContent = buttonName;
	downloadButton.classList.add(...Style.Button);
	downloadButton.classList.add(...Style.ButtonPrimary);
	downloadButton.style.marginLeft = "4px";
	downloadButton.style.marginBottom = "4px";
	downloadButton.style.display = "block";
	downloadButton.addEventListener("click", function() {
		console.log(data);
		downloadFile(data, fileName);
	});
	return downloadButton;
	
}

export function Calculator_pre(tile)
{
	clearChildren(tile);
	const calcDiv = document.createElement("div");
	tile.appendChild(calcDiv);
	tile.style.display = "flex";
	tile.style.flexDirection = "row";
	calcDiv.style.maxHeight = "400px";
	const output = document.createElement("input");
	output.classList.add("input-text");
	output.style.fontSize = "20px";
	output.readOnly = true;
	output.style.textAlign = "right";
	calcDiv.style.display = "flex";
	calcDiv.style.flexDirection = "column";
	calcDiv.style.alignItems = "center";
	calcDiv.style.width = "60%";
	calcDiv.style.minWidth = "180px";
	
	const historyDiv = document.createElement("div");
	tile.appendChild(historyDiv);
	historyDiv.style.width = "35%";
	historyDiv.style.marginTop = "10px";
	historyDiv.style.display = "block";
	historyDiv.style.maxHeight = "195px";
	historyDiv.style.backgroundColor = "rgb(35, 40, 43)";
	historyDiv.style.borderColor = "rgb(43,72,90)";
	historyDiv.style.borderWidth = "1px";
	historyDiv.style.borderStyle = "solid";
	const historyTable = document.createElement("table");
	historyDiv.appendChild(historyTable);
	const historyTableBody = document.createElement("tbody");
	historyTable.appendChild(historyTableBody);
	
	output.style.display = "block";
	output.style.width = "90%"
	output.style.height = "36px";
	output.style.margin = "10px";
	output.style.cursor = "default";
	calcDiv.appendChild(output);
	var currentString = "";
	var prevValue = null;
	var currentOperation = null;
	var clearOnNext = false;
	var doubleClear = false;
	const keypad = document.createElement("div");
	calcDiv.appendChild(keypad);
	keypad.style.width = "95%";
	keypad.style.display = "grid";
	keypad.style.gridTemplateColumns = "repeat(4, 1fr)"
	const layout = [[7, null], [8, null], [9, null], ["÷", "#3fa2de"], [4, null], [5, null], [6, null], ["x", "#3fa2de"], [1, null], [2, null], [3, null], ["-", "#3fa2de"], [0, null], [".", null], ["±", null], ["+", "#3fa2de"]];
	layout.forEach(opt => 
	{
		const button = document.createElement("button");
		button.classList.add("refresh-button");
		button.style.fontSize = "20px";
		button.textContent = (opt[0] == 0 ? "0" : opt[0] || "").toString();
		if(opt[1] != null){button.style.backgroundColor = opt[1] as string;}
		keypad.appendChild(button);
		
		button.onclick = function()
		{
			if(opt[0] == "+" || opt[0] == "-" || opt[0] == "x" || opt[0] == "÷")
			{
				if(currentOperation != null)
				{
					currentString = calculate(prevValue, currentString, currentOperation);
					currentOperation = null;
					prevValue = null;
				}
				currentOperation = opt[0] as any;
				clearOnNext = true;
				output.value = parseFloat(currentString).toLocaleString(undefined, {maximumFractionDigits: 12});
			}
			else if(opt[0] == "±")
			{
				if(currentString.toString().charAt(0) == "-")
				{
					currentString = currentString.substring(1);
				}
				else
				{
					currentString = "-" + currentString;
				}
				output.value = parseFloat(currentString).toLocaleString(undefined, {maximumFractionDigits: 12});
			}
			else
			{
				if(clearOnNext){
					prevValue = parseFloat(currentString) as any;
					currentString = "";
					clearOnNext = false;
				}
				currentString += (opt[0] == 0 ? "0" : opt[0] || "").toString();
				output.value = parseFloat(currentString).toLocaleString(undefined, {maximumFractionDigits: 12});
			}
			doubleClear = false;
		}
		return;
	});
	const bottomDiv = document.createElement("div");
	calcDiv.appendChild(bottomDiv);
	bottomDiv.style.width = "95%";
	bottomDiv.style.display = "grid";
	bottomDiv.style.gridTemplateColumns = "repeat(2, 1fr)"
	const clear = document.createElement("button");
	bottomDiv.appendChild(clear);
	clear.textContent = "Clear";
	clear.classList.add("refresh-button");
	clear.style.fontSize = "20px";
	clear.style.backgroundColor = "rgb(217, 83, 79)";
	clear.onclick = function()
	{
		currentString = "" as string;
		output.value = currentString
		currentOperation = null as any;
		prevValue = null as any;
		clearOnNext = false;
		if(doubleClear)
		{
			clearChildren(historyTableBody);
		}
		doubleClear = true;
	}
	
	const enter = document.createElement("button");
	enter.onclick = function()
	{
		if(currentOperation != null)
		{
			currentString = calculate(prevValue, currentString, currentOperation);
			currentOperation = null;
			prevValue = null;
		}
		output.value = parseFloat(currentString).toLocaleString(undefined, {maximumFractionDigits: 12});
		const tr = document.createElement("tr");
		const td = document.createElement("td");
		td.textContent = output.value;
		tr.appendChild(td);
		if(historyTableBody.children.length > 11)
		{
			historyTableBody.removeChild(historyTableBody.children[historyTableBody.children.length - 1]);
		}
		if(historyTableBody.children.length > 0)
		{
			historyTableBody.insertBefore(tr, historyTableBody.firstChild);
		}
		else
		{
			historyTableBody.appendChild(tr);
		}
		doubleClear = false;
	}
	bottomDiv.appendChild(enter);
	enter.textContent = "Enter";
	enter.classList.add("refresh-button");
	enter.style.fontSize = "20px";
	enter.style.backgroundColor = "#5cb85c";
	
	tile.addEventListener("keydown", (e) => {
		if(e.key === "1" || e.key === "2" || e.key === "3" || e.key === "4" || e.key === "5" || e.key === "6" || e.key === "7" || e.key === "8" || e.key === "9" || e.key === "0" || e.key === ".")
		{
			if(clearOnNext){
				prevValue = parseFloat(currentString) as any;
				currentString = "";
				clearOnNext = false;
			}
			currentString += e.key;
			output.value = parseFloat(currentString).toLocaleString(undefined, {maximumFractionDigits: 12});
		}
		else if(e.key === "+" || e.key === "-" || e.key === "x" || e.key === "*" || e.key === "/")
		{
			if(currentOperation != null)
			{
				currentString = calculate(prevValue, currentString, currentOperation);
				currentOperation = null;
				prevValue = null;
			}
			currentOperation = e.key;
			clearOnNext = true;
			output.value = parseFloat(currentString).toLocaleString(undefined, {maximumFractionDigits: 12});
		}
		else if(e.key === "Enter" || e.key === "=")
		{
			if(currentOperation != null)
			{
				currentString = calculate(prevValue, currentString, currentOperation);
				currentOperation = null;
				prevValue = null;
			}
			output.value = parseFloat(currentString).toLocaleString(undefined, {maximumFractionDigits: 12});
			const tr = document.createElement("tr");
			const td = document.createElement("td");
			td.textContent = output.value;
			tr.appendChild(td);
			if(historyTableBody.children.length > 11)
			{
				historyTableBody.removeChild(historyTableBody.children[historyTableBody.children.length - 1]);
			}
			if(historyTableBody.children.length > 0)
			{
				historyTableBody.insertBefore(tr, historyTableBody.firstChild);
			}
			else
			{
				historyTableBody.appendChild(tr);
			}
			doubleClear = false;
		}
		else if(e.key === "Escape")
		{
			currentString = "";
			output.value = currentString
			currentOperation = null;
			prevValue = null;
			clearOnNext = false;
			if(doubleClear)
			{
				clearChildren(historyTableBody);
			}
			doubleClear = true;
		}
		else if(e.key === "Backspace")
		{
			if(currentString.length > 0)
			{
				currentString = currentString.slice(0, -1);
				output.value = parseFloat(currentString).toLocaleString(undefined, {maximumFractionDigits: 12});
			}
		}
	});
	
	return;
}

function calculate(prevValue, currentString, currentOperation)
{
	currentString = parseFloat(currentString);
	if(currentOperation == "+")
	{
		return prevValue + currentString;
	}
	else if(currentOperation == "-")
	{
		return prevValue - currentString;
	}
	else if(currentOperation == "x" || currentOperation == "*")
	{
		return prevValue * currentString;
	}
	else if(currentOperation == "÷" || currentOperation == "/")
	{
		return prevValue / currentString;
	}
	else
	{
		return 0;
	}
}

export function Repairs_pre(tile, parameters, result)
{
	clearChildren(tile);
	if(!result["PMMGExtended"]["username"])
	{
		tile.textContent = "Error! Missing Username";
		return;
	}
	if(!result["PMMGExtended"]["apikey"])
	{
		tile.textContent = "Error! Missing API Key";
		return;
	}
	XITWebRequest(tile, parameters, Repairs_post, "https://rest.fnar.net/sites/"+ result["PMMGExtended"]["username"], "GET", ["Authorization", result["PMMGExtended"]["apikey"]], undefined);
	
	return;
}

function Repairs_post(tile, parameters, jsondata)
{
	if(jsondata == undefined || jsondata == null){return;}
	var repairData;
	try
	{
		repairData = JSON.parse(jsondata);
	}
	catch(SyntaxError)
	{
		tile.textContent = "Error! Could Not Load Data!";
		return;
	}
	if(parameters.length < 2)
	{
		const title = createTextSpan("All Repairs");
		title.classList.add("title");
		tile.appendChild(title);
		
		const thresholdDiv = document.createElement("div");
		tile.appendChild(thresholdDiv);
		
		const thresholdInput = document.createElement("input");
		thresholdInput.classList.add("input-text");
		const thresholdText = createTextSpan("Age Threshold:");
		thresholdText.style.paddingLeft = "5px";
		thresholdInput.type = "number";
		thresholdInput.value = "70";
		thresholdInput.style.width = "60px";
		thresholdDiv.appendChild(thresholdText);
		thresholdDiv.appendChild(thresholdInput);
		const matTitle = createTextSpan("Shopping Cart");
		matTitle.classList.add("title");
		matTitle.style.paddingBottom = "2px";
		tile.appendChild(matTitle);
		const matDiv = document.createElement("div");
		tile.appendChild(matDiv);
		const buiTitle = createTextSpan("Buildings");
		buiTitle.classList.add("title");
		buiTitle.style.paddingTop = "5px";
		buiTitle.style.paddingBottom = "2px";
		tile.appendChild(buiTitle);
		const table = document.createElement("table");
		
		const head = document.createElement("thead");
		const hr = document.createElement("tr");
		head.appendChild(hr);
		table.appendChild(head);
		tile.appendChild(table);
		for(let t of ["Ticker", "Planet", "Age", "Condition"])
		{
			const header = document.createElement("th");
			header.textContent = t;
			header.style.paddingTop = "0";
			hr.appendChild(header);
		}
		var buildings = [] as any[];
		repairData.forEach(site => {
			site["Buildings"].forEach(build => {
				buildings.push([site["PlanetName"], build]);
				return;
			});
			return;
		});
		buildings.sort(globalBuildingSort);
		
		const body = document.createElement("tbody");
		table.appendChild(body);
		generateGeneralRepairScreen(body, matDiv, buildings, thresholdInput);
		
		thresholdInput.addEventListener("input", function(){
			clearChildren(body);
			
			generateGeneralRepairScreen(body, matDiv, buildings, thresholdInput);
		});
		
	}
	else
	{
		const title = createTextSpan(parameters[1] + " Repairs");
		title.classList.add("title");
		tile.appendChild(title);
		
		var siteData = undefined;
		repairData.forEach(site => {
			if(site["PlanetName"].toUpperCase() == parameters[1].toUpperCase() || site["PlanetIdentifier"].toUpperCase() == parameters[1].toUpperCase())
			{
				siteData = site;
			}
			return;
		});
		if(siteData == undefined){return;}
		
		const thresholdDiv = document.createElement("div");
		tile.appendChild(thresholdDiv);
		
		const thresholdInput = document.createElement("input");
		thresholdInput.classList.add("input-text");
		const thresholdText = createTextSpan("Age Threshold:");
		thresholdText.style.paddingLeft = "5px";
		thresholdInput.type = "number";
		thresholdInput.value = "70";
		thresholdInput.style.width = "60px";
		thresholdDiv.appendChild(thresholdText);
		thresholdDiv.appendChild(thresholdInput);
		const matTitle = createTextSpan("Shopping Cart");
		matTitle.classList.add("title");
		matTitle.style.paddingBottom = "2px";
		tile.appendChild(matTitle);
		const matDiv = document.createElement("div");
		tile.appendChild(matDiv);
		const buiTitle = createTextSpan("Buildings");
		buiTitle.classList.add("title");
		buiTitle.style.paddingTop = "5px";
		buiTitle.style.paddingBottom = "2px";
		tile.appendChild(buiTitle);
		const table = document.createElement("table");
		
		const head = document.createElement("thead");
		const hr = document.createElement("tr");
		head.appendChild(hr);
		table.appendChild(head);
		tile.appendChild(table);
		for(let t of ["Ticker", "Age", "Condition"])
		{
			const header = document.createElement("th");
			header.textContent = t;
			header.style.paddingTop = "0";
			hr.appendChild(header);
		}
		siteData["Buildings"].sort(buildingSort);
		
		const body = document.createElement("tbody");
		table.appendChild(body);
		generateRepairScreen(body, matDiv, siteData, thresholdInput);
		
		thresholdInput.addEventListener("input", function(){
			clearChildren(body);
			
			generateRepairScreen(body, matDiv, siteData, thresholdInput);
		});
	}
	return;
}

function generateRepairScreen(body, matDiv, siteData, thresholdInput)
{
	const nonProd = ["CM", "HB1", "HB2", "HB3", "HB4", "HB5", "HBB", "HBC", "HBL", "HBM", "STO"];
	const materials = {};
	siteData["Buildings"].forEach(building => {
		const row = document.createElement("tr");
		body.appendChild(row);
		if(nonProd.includes(building["BuildingTicker"])){return;}
		const date = (((new Date()).getTime() - (building["BuildingLastRepair"] || building["BuildingCreated"])) / 86400000);
		if(date < parseFloat(thresholdInput.value)){return;}
		
		building["RepairMaterials"].forEach(mat => {
			if(materials[mat["MaterialTicker"]] == undefined){materials[mat["MaterialTicker"]] = mat["MaterialAmount"];}
			else{materials[mat["MaterialTicker"]] += mat["MaterialAmount"];}
			return;
		});
		
		var rowData = [building["BuildingTicker"], date.toLocaleString(undefined, {maximumFractionDigits: 1}), (building["Condition"] * 100).toLocaleString(undefined, {maximumFractionDigits: 1}) + "%"];
		for(let point of rowData)
		{
			const tableElem = document.createElement("td");
			row.appendChild(tableElem);
			tableElem.appendChild(createTextSpan(point));
		}
		return;
	});
	
	clearChildren(matDiv);
	matDiv.style.maxWidth = "200px";
	
	const table = document.createElement("table");
	matDiv.appendChild(table);
	const head = document.createElement("thead");
	const hr = document.createElement("tr");
	head.appendChild(hr);
	table.appendChild(head);
	for(let t of ["Material", "Amount"])
	{
		const header = document.createElement("th");
		header.textContent = t;
		header.style.paddingTop = "0";
		hr.appendChild(header);
	}
	const mbody = document.createElement("tbody");
	table.appendChild(mbody);
	Object.keys(materials).sort().forEach(mat => {
		const row = document.createElement("tr");
		mbody.appendChild(row);
		var rowData = [mat, materials[mat].toLocaleString(undefined)];
		for(let point of rowData)
		{
			const tableElem = document.createElement("td");
			row.appendChild(tableElem);
			tableElem.appendChild(createTextSpan(point));
		}
		return;
	});
	return;
}

function generateGeneralRepairScreen(body, matDiv, buildings, thresholdInput)
{
	const nonProd = ["CM", "HB1", "HB2", "HB3", "HB4", "HB5", "HBB", "HBC", "HBL", "HBM", "STO"];
	const materials = {};
	buildings.forEach(building => {
		const row = document.createElement("tr");
		body.appendChild(row);
		if(nonProd.includes(building[1]["BuildingTicker"])){return;}
		const date = (((new Date()).getTime() - (building[1]["BuildingLastRepair"] || building[1]["BuildingCreated"])) / 86400000);
		if(date < parseFloat(thresholdInput.value)){return;}
		
		building[1]["RepairMaterials"].forEach(mat => {
			if(materials[mat["MaterialTicker"]] == undefined){materials[mat["MaterialTicker"]] = mat["MaterialAmount"];}
			else{materials[mat["MaterialTicker"]] += mat["MaterialAmount"];}
		});
		
		var rowData = [building[1]["BuildingTicker"], building[0], date.toLocaleString(undefined, {maximumFractionDigits: 1}), (building[1]["Condition"] * 100).toLocaleString(undefined, {maximumFractionDigits: 1}) + "%"];
		for(let point of rowData)
		{
			const tableElem = document.createElement("td");
			row.appendChild(tableElem);
			tableElem.appendChild(createTextSpan(point));
		}
		return;
	});
	
	clearChildren(matDiv);
	matDiv.style.maxWidth = "200px";
	
	const table = document.createElement("table");
	matDiv.appendChild(table);
	const head = document.createElement("thead");
	const hr = document.createElement("tr");
	head.appendChild(hr);
	table.appendChild(head);
	for(let t of ["Material", "Amount"])
	{
		const header = document.createElement("th");
		header.textContent = t;
		header.style.paddingTop = "0";
		hr.appendChild(header);
	}
	const mbody = document.createElement("tbody");
	table.appendChild(mbody);
	Object.keys(materials).sort().forEach(mat => {
		const row = document.createElement("tr");
		mbody.appendChild(row);
		var rowData = [mat, materials[mat].toLocaleString(undefined)];
		for(let point of rowData)
		{
			const tableElem = document.createElement("td");
			row.appendChild(tableElem);
			tableElem.appendChild(createTextSpan(point));
		}
		return;
	});
	return;
}

function buildingSort(a, b)
{
	return a["Condition"] > b["Condition"] ? 1 : -1;
}

function globalBuildingSort(a, b)
{
	return a[1]["Condition"] > b[1]["Condition"] ? 1 : -1;
}

export function Chat_pre(tile, parameters)
{
	clearChildren(tile);
	if(parameters.length < 2)
	{
		tile.textContent = "Error! Not Enough Parameters!";
	}
	
	XITWebRequest(tile, parameters, Chat_post, "https://rest.fnar.net/chat/display/" + parameters[1], "GET", undefined, undefined);
	return;
}

function Chat_post(chatDiv, parameters, jsondata)
{
	if(jsondata == undefined || jsondata == null){return;}
	var chatData;
	try
	{
		chatData = JSON.parse(jsondata);
	}
	catch(SyntaxError)
	{
		chatDiv.textContent = "Error! Could Not Load Data!";
		return;
	}
	const titleDiv = document.createElement("div");
	titleDiv.textContent = parameters[1] + " Global Site Owners";
	titleDiv.classList.add("title");
	chatDiv.appendChild(titleDiv);
	
	chatData.forEach(chat => {
		const chatLine = document.createElement("div");
		chatLine.classList.add("chat-line");
		chatDiv.appendChild(chatLine);
		
		const timeDateDiv = document.createElement("div");
		
		const dateDiv = document.createElement("div");
		timeDateDiv.appendChild(dateDiv);
		dateDiv.textContent = (new Date(chat["MessageTimestamp"])).toLocaleDateString(undefined, {month: "2-digit", day: "2-digit"});
		dateDiv.classList.add("time-date");
		
		const timeDiv = document.createElement("div");
		timeDateDiv.appendChild(timeDiv);
		timeDiv.textContent = (new Date(chat["MessageTimestamp"])).toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"});
		timeDiv.classList.add("time-date");
		timeDiv.style.color = "#999999";
		
		chatLine.appendChild(timeDateDiv);
		
		const nameDiv = document.createElement("div");
		chatLine.appendChild(nameDiv);
		nameDiv.classList.add("chat-name");
		
		const messageDiv = document.createElement("div");
		chatLine.appendChild(messageDiv);
		messageDiv.classList.add("chat-message");
		
		switch(chat["MessageType"])
		{
			case "CHAT":
				nameDiv.textContent = chat["UserName"];
				messageDiv.textContent = chat["MessageText"];
				break;
			case "JOINED":
				messageDiv.textContent = chat["UserName"] + " joined.";
				messageDiv.style.fontStyle = "italic";
				break;
			case "LEFT":
				messageDiv.textContent = chat["UserName"] + " left.";
				messageDiv.style.fontStyle = "italic";
				break;
		}
		return;
	});
	return;
}

export function Fin_pre(tile, parameters, result)
{
	clearChildren(tile);
	if(parameters.length < 2)
	{
		tile.textContent = "Error! Not Enough Parameters!";
		return;
	}
	if(!result["PMMGExtended"]["webappid"]){return;}
	const url = "https://script.google.com/macros/s/" + result["PMMGExtended"]["webappid"] + "/exec?mode=%22fin%22&param=%22" + parameters[1] + "%22";
	
	XITWebRequest(tile, parameters, Fin_post, url, "GET", undefined, undefined);
	return;
}

function Fin_post(tile, parameters, jsondata)
{
	if(jsondata == undefined || jsondata == null){return;}
	var data;
	try
	{
		data = JSON.parse(jsondata);
	}
	catch(SyntaxError)
	{
		tile.textContent = "Error! Could Not Load JSON Data!";
		return parameters;
	}
	const tileHeader = document.createElement("h2");
	tileHeader.title = "Financial Overview";
	tileHeader.textContent = "Key Figures";
	tileHeader.classList.add("fin-title");
	tile.appendChild(tileHeader);
	
	tile.appendChild(createFinancialTextBox(Math.round(data[0][1]).toLocaleString(), "Fixed Assets", TextColors.Standard));
	tile.appendChild(createFinancialTextBox(Math.round(data[0][2]).toLocaleString(), "Current Assets", TextColors.Standard));
	tile.appendChild(createFinancialTextBox(Math.round(data[0][4]).toLocaleString(), "Liquid Assets", TextColors.Standard));
	tile.appendChild(createFinancialTextBox(Math.round(data[0][7]).toLocaleString(), "Equity", TextColors.Standard));
	tile.appendChild(createFinancialTextBox(Math.round(data[0][5]).toLocaleString(), "Liabilities", TextColors.Standard));
	
	const now = data[0][0];
	var weekAgo = -1;
	var bestGuess = 86400000000;
	for(var i = 1; i < data.length; i++)
	{
		if(Math.abs(Math.abs(now - data[i][0]) - 7*86400000) < bestGuess)
		{
			bestGuess = Math.abs(Math.abs(now - data[i][0]) - 7*86400000);
			weekAgo = i;
		}
	}
	if(weekAgo != -1)
	{
		const profit = Math.round(data[0][7] - data[weekAgo][7]);
		const color = profit > 0 ? TextColors.Success : TextColors.Failure;
		tile.appendChild(createFinancialTextBox(profit.toLocaleString(), "Profit", color));
	}
	
	const breakdownHeader = document.createElement("h2");
	breakdownHeader.title = "Financial Breakdown";
	breakdownHeader.textContent = "Inventory Breakdown";
	breakdownHeader.classList.add("fin-title");
	tile.appendChild(breakdownHeader);
	
	const table = document.createElement("table");
	const head = document.createElement("thead");
	const headRow = document.createElement("tr");
	head.appendChild(headRow);
	table.appendChild(head);
	const headers = ["Name", "Fixed Assets", "Current Assets", "Total Assets"];
	for(let title of headers)
	{
		const header = document.createElement("th");
		header.textContent = title;
		headRow.appendChild(header);
	}
	
	const body = document.createElement("tbody");
	table.appendChild(body);
	
	const breakdown = JSON.parse(data[0][8]);
	breakdown.sort(financialSort);
	
	for(let rowData of breakdown)
	{
		const row = document.createElement("tr");
		body.appendChild(row);
		const firstTableElem = document.createElement("td");
		row.appendChild(firstTableElem);
		firstTableElem.appendChild(createTextSpan(rowData[0]));
		rowData.shift();
		for(let point of rowData)
		{
			const tableElem = document.createElement("td");
			row.appendChild(tableElem);
			tableElem.appendChild(createTextSpan(point.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})));
		}
	}
	
	tile.appendChild(table);
	return;
}

function financialSort(a, b)
{
	return a[3] < b[3] ? 1 : -1;
}

export function EnhancedBurn_pre(tile, parameters, result, fullBurn, burnSettings)
{
	clearChildren(tile);
	if(!result["PMMGExtended"]["apikey"])
	{
		tile.textContent = "Error! No API Key!";
		return;
	}
	const apikey = result["PMMGExtended"]["apikey"];
	const username = result["PMMGExtended"]["username"];
	var burn;
	var unloaded = false;
	var planet;
	if(parameters.length < 2)
	{
		tile.textContent = "Error! Not Enough Parameters!";
		return;
	}
	else if(parameters.length == 3 && parameters[1].toLowerCase() == "group")
	{
		if(fullBurn[parameters[2]] != undefined && fullBurn[parameters[2]].length > 0){burn = fullBurn[parameters[2]];}
		else
		{
			unloaded = true;
			if(tile.id != "pmmg-reload")
			{
				getGroupBurn(fullBurn, parameters[2], apikey);
			}
		}
	}
	else
	{
		if(fullBurn[username] != undefined && fullBurn[username].length > 0){burn = fullBurn[username];planet = parameters[1];}
		else{unloaded = true;}
	}
	if(burnSettings[0] == "loading" || unloaded)
	{
		tile.textContent = "Loading Burn Data...";
		tile.id = "pmmg-reload";
		return;
	}
	
	// Burn data is non-empty
	tile.id = "pmmg-load-success";
	var settings;
	if(parameters[1].toLowerCase() == "group")
	{
		var inv = {};
		var cons = {};
		fullBurn[parameters[2]].forEach(planetData => {
			if(planetData["Error"] == null)
			{
				planetData["Inventory"].forEach(material => {
					if(inv[material["MaterialTicker"]] == undefined)
					{
						inv[material["MaterialTicker"]] = material["MaterialAmount"];
					}
					else
					{
						inv[material["MaterialTicker"]] += material["MaterialAmount"];
					}
					return;
				});
				
				planetData["OrderConsumption"].forEach(material => {
					if(cons[material["MaterialTicker"]] == undefined)
					{
						cons[material["MaterialTicker"]] = -material["DailyAmount"];
					}
					else
					{
						cons[material["MaterialTicker"]] -= material["DailyAmount"];
					}
				});
				
				planetData["WorkforceConsumption"].forEach(material => {
					if(cons[material["MaterialTicker"]] == undefined)
					{
						cons[material["MaterialTicker"]] = -material["DailyAmount"];
					}
					else
					{
						cons[material["MaterialTicker"]] -= material["DailyAmount"];
					}
					return;
				});
				
				planetData["OrderProduction"].forEach(material => {
					if(cons[material["MaterialTicker"]] == undefined)
					{
						cons[material["MaterialTicker"]] = material["DailyAmount"];
					}
					else
					{
						cons[material["MaterialTicker"]] += material["DailyAmount"];
					}
					return;
				});
			}
			return;
		});
	} else
	{
		const planetBurn = findCorrespondingPlanet(planet, burn);	// The planet data to work with
		settings = findCorrespondingPlanet(planet, burnSettings);
		if(planetBurn == undefined){tile.textContent = "Error! No Matching Planet!";return;}
		
		
		var cons = {};
		var inv = {};
		for(let material of planetBurn["WorkforceConsumption"])
		{
			if(cons[material["MaterialTicker"]] == undefined)
			{
				cons[material["MaterialTicker"]] = -material["DailyAmount"];
				continue;
			}
			cons[material["MaterialTicker"]] -= material["DailyAmount"]; 
		}
		for(let material of planetBurn["OrderConsumption"])
		{
			if(cons[material["MaterialTicker"]] == undefined)
			{
				cons[material["MaterialTicker"]] = -material["DailyAmount"];
				continue;
			}
			cons[material["MaterialTicker"]] -= material["DailyAmount"]; 
		}
		for(let material of planetBurn["OrderProduction"])
		{
			if(cons[material["MaterialTicker"]] == undefined)
			{
				cons[material["MaterialTicker"]] = material["DailyAmount"];
				continue;
			}
			cons[material["MaterialTicker"]] += material["DailyAmount"]; 
		}
		for(let material of planetBurn["Inventory"])
		{
			if(inv[material["MaterialTicker"]] == undefined)
			{
				inv[material["MaterialTicker"]] = material["MaterialAmount"];
				continue;
			}
			inv[material["MaterialTicker"]] += material["MaterialAmount"]; 
		}
	}
	const screenNameElem = document.querySelector(Selector.ScreenName);
	const screenName = screenNameElem ? screenNameElem.textContent : "";
	if(!result["PMMGExtended"]["burn_display_settings"]){result["PMMGExtended"]["burn_display_settings"] = [];}
	var settingsIndex = FindBurnSettings(result["PMMGExtended"]["burn_display_settings"], screenName + parameters[1]);
	const dispSettings = settingsIndex == -1 ? [1, 1, 1, 1] : result["PMMGExtended"]["burn_display_settings"][settingsIndex][1];
	
	const table = document.createElement("table");
	const settingsDiv = document.createElement("div");
	settingsDiv.style.display = "flex";
	tile.appendChild(settingsDiv);
	settingsDiv.appendChild(createSettingsButton("RED", 22.025, dispSettings[0], function(){
		dispSettings[0] = dispSettings[0] ? 0 : 1;
		UpdateBurn(table, dispSettings);
		if(settingsIndex == -1)
		{
			result["PMMGExtended"]["burn_display_settings"].push([screenName + parameters[1], dispSettings]);
			settingsIndex = result["PMMGExtended"]["burn_display_settings"].length - 1;
		}
		else
		{
			result["PMMGExtended"]["burn_display_settings"][settingsIndex][1] = dispSettings;
		}
		setSettings(result);
	}));
	settingsDiv.appendChild(createSettingsButton("YELLOW", 40.483, dispSettings[1], function(){
		dispSettings[1] = dispSettings[1] ? 0 : 1;
		UpdateBurn(table, dispSettings);
		if(settingsIndex == -1)
		{
			result["PMMGExtended"]["burn_display_settings"].push([screenName + parameters[1], dispSettings]);
			settingsIndex = result["PMMGExtended"]["burn_display_settings"].length - 1;
		}
		else
		{
			result["PMMGExtended"]["burn_display_settings"][settingsIndex][1] = dispSettings;
		}
		setSettings(result);
	}));
	settingsDiv.appendChild(createSettingsButton("GREEN", 34.65, dispSettings[2], function(){
		dispSettings[2] = dispSettings[2] ? 0 : 1;
		UpdateBurn(table, dispSettings);
		if(settingsIndex == -1)
		{
			result["PMMGExtended"]["burn_display_settings"].push([screenName + parameters[1], dispSettings]);
			settingsIndex = result["PMMGExtended"]["burn_display_settings"].length - 1;
		}
		else
		{
			result["PMMGExtended"]["burn_display_settings"][settingsIndex][1] = dispSettings;
		}
		setSettings(result);
	}));
	settingsDiv.appendChild(createSettingsButton("INF", 19.6, dispSettings[3], function(){
		dispSettings[3] = dispSettings[3] ? 0 : 1;
		UpdateBurn(table, dispSettings);
		if(settingsIndex == -1)
		{
			result["PMMGExtended"]["burn_display_settings"].push([screenName + parameters[1], dispSettings]);
			settingsIndex = result["PMMGExtended"]["burn_display_settings"].length - 1;
		}
		else
		{
			result["PMMGExtended"]["burn_display_settings"][settingsIndex][1] = dispSettings;
		}
		setSettings(result);
	}));
	
	
	const head = document.createElement("thead");
	const headRow = document.createElement("tr");
	head.appendChild(headRow);
	table.appendChild(head);
	for(let title of ["Needs", "Production", "Inv", "Amt. Needed", "Burn"])
	{
		const header = document.createElement("th");
		header.textContent = title;
		header.style.paddingTop = "0";
		headRow.appendChild(header);
	}
	(headRow.firstChild as HTMLTableCellElement).colSpan = 2;
	
	const body = document.createElement("tbody");
	table.appendChild(body);
	
	var burnMaterials = Object.keys(cons);
	burnMaterials.sort(CategorySort);
	for(let material of burnMaterials)
	{
		var included = true;
		if(settings != undefined && parameters[1].toLowerCase() != "group")
		{
			settings["MaterialExclusions"].forEach((mat) => {
				if(mat["MaterialTicker"] == material){included = false;return;}
				return;
			});
		}
		if(!included){continue;}
		
		const row = document.createElement("tr");
		body.appendChild(row);
		const materialColumn = document.createElement("td");
		materialColumn.style.width = "32px";
		materialColumn.style.paddingRight = "0px";
		materialColumn.style.paddingLeft = "0px";
		const matElem = createMaterialElement(material, "prun-remove-js", "none", false, true);
		if(matElem){materialColumn.appendChild(matElem);}
		row.appendChild(materialColumn);
		const nameSpan = createTextSpan(MaterialNames[material][0]);
		nameSpan.style.fontWeight = "bold";
		const nameColumn = document.createElement("td");
		nameColumn.appendChild(nameSpan);
		row.appendChild(nameColumn);
		
		const consColumn = document.createElement("td");
		consColumn.appendChild(createTextSpan(cons[material].toLocaleString(undefined, {maximumFractionDigits: 1}) + " / Day"));
		row.appendChild(consColumn);
		
		const invColumn = document.createElement("td");
		const invAmount = inv[material] == undefined ? 0 : inv[material];
		invColumn.appendChild(createTextSpan(invAmount.toLocaleString(undefined)));
		row.appendChild(invColumn);
		
		const burn = invAmount == 0 ? 0 : -invAmount / cons[material];
		const burnColumn = document.createElement("td");
		burnColumn.appendChild(createTextSpan(((burn < 500 && cons[material] < 0) ? Math.floor(burn).toLocaleString(undefined, {maximumFractionDigits: 0}) : "∞") + " Days"));
		if(cons[material] >= 0)
		{
			burnColumn.classList.add("burn-green");
			burnColumn.classList.add("burn-infinite");
		}
		else if(burn <= (result["PMMGExtended"]["burn_thresholds"] || [3, 7])[0])
		{
			burnColumn.classList.add("burn-red");
		}
		else if(burn <= (result["PMMGExtended"]["burn_thresholds"] || [3, 7])[1])
		{
			burnColumn.classList.add("burn-yellow");
		}
		else
		{
			burnColumn.classList.add("burn-green");
		}
		
		const needColumn = document.createElement("td");
		const needAmt = burn > (result["PMMGExtended"]["burn_thresholds"] || [3, 7])[1] || cons[material] > 0 ? 0 : (burn - (result["PMMGExtended"]["burn_thresholds"] || [3, 7])[1]) * cons[material];
		needColumn.appendChild(createTextSpan(needAmt.toLocaleString(undefined, {maximumFractionDigits: 0})));
		
		row.appendChild(needColumn);
		row.appendChild(burnColumn);
		
	}
	UpdateBurn(table, dispSettings);
	tile.appendChild(table);
	return;
}

function FindBurnSettings(array, matchString)
{
	for(var i = 0; i < array.length; i++)
	{
		if(matchString == array[i][0])
		{
			return i;
		}
	}
	return -1;
}

function UpdateBurn(table, dispSettings)
{
	(Array.from(table.children[1].children) as HTMLElement[]).forEach(row => {
		if(row.children[5].classList.contains("burn-infinite"))
		{
			row.style.display = dispSettings[3] ? "table-row" :"none";
			row.style.visibility = dispSettings[3] ? "visible" : "hidden";
			row.style.width = dispSettings[3] ? "auto" : "0px";
			row.style.height = dispSettings[3] ? "auto" : "0px";
		}
		else if(row.children[5].classList.contains("burn-green"))
		{
			row.style.display = dispSettings[2] ? "table-row" :"none";
			row.style.visibility = dispSettings[2] ? "visible" : "hidden";
			row.style.width = dispSettings[2] ? "auto" : "0px";
			row.style.height = dispSettings[2] ? "auto" : "0px";
		}
		else if(row.children[5].classList.contains("burn-yellow"))
		{
			row.style.display = dispSettings[1] ? "table-row" :"none";
			row.style.visibility = dispSettings[1] ? "visible" : "hidden";
			row.style.width = dispSettings[1] ? "auto" : "0px";
			row.style.height = dispSettings[1] ? "auto" : "0px";
		}
		else if(row.children[5].classList.contains("burn-red"))
		{
			row.style.display = dispSettings[0] ? "table-row" :"none";
			row.style.visibility = dispSettings[0] ? "visible" : "hidden";
			row.style.width = dispSettings[0] ? "auto" : "0px";
			row.style.height = dispSettings[0] ? "auto" : "0px";
		}
		return;
	});
	return;
}

function CategorySort(a, b)
{
	if(MaterialNames[a] == undefined || MaterialNames[b] == undefined){return 0;}
	return MaterialNames[a][1].localeCompare(MaterialNames[b][1]);
}

export function SheetTable_pre(tile, parameters, result)
{
	clearChildren(tile);
	if(parameters.length < 2)
	{
		tile.textContent = "Error! Not Enough Parameters!";
		return;
	}
	if(result["PMMGExtended"]["webappid"] == undefined){return;}
	var url = "https://script.google.com/macros/s/" + result["PMMGExtended"]["webappid"] + "/exec?mode=%22" + parameters[1] + "%22";
	if(parameters[2] != undefined)
	{
		url += "&param=%22" + parameters[2] + "%22";
	}
	
	XITWebRequest(tile, parameters, SheetTable_post, url, "GET", undefined, undefined);
	return;
}

function createSettingsButton(text, width, toggled, f)
{
	const button = document.createElement("span");
	const bar = document.createElement("div");
	if(toggled)
	{
		bar.classList.add(...Style.SettingsBarToggled);
	}
	else
	{
		bar.classList.add(...Style.SettingsBarUntoggled);
	}
	const textBox = document.createElement("div");
	textBox.classList.add(...Style.SettingsText);
	textBox.textContent = text;
	button.classList.add(...Style.SettingsButton);
	bar.style.width = width + "px";
	bar.style.maxWidth = width + "px";
	button.appendChild(bar);
	button.appendChild(textBox);
	button.addEventListener("click", function() {
		if(toggled)
		{
			bar.classList.remove(...Style.SettingsBarToggled);
			bar.classList.add(...Style.SettingsBarUntoggled);
			toggled = false;
		}
		else
		{
			bar.classList.remove(...Style.SettingsBarUntoggled);
			bar.classList.add(...Style.SettingsBarToggled);
			toggled = true;
		}
		f();
	});
	return button;
}

function SheetTable_post(tile, parameters, jsondata)
{
	if(jsondata == undefined || jsondata == null){return;}
	var data;
	try
	{
		data = JSON.parse(jsondata);
	}
	catch(SyntaxError)
	{
		tile.textContent = "Error! Could Not Load JSON Data!";
		return parameters;
	}
	
	const table = document.createElement("table");
	
	const head = document.createElement("thead");
	const headRow = document.createElement("tr");
	head.appendChild(headRow);
	table.appendChild(head);
	for(let title of data[0])
	{
		const header = document.createElement("th");
		header.textContent = title;
		header.style.paddingTop = "0";
		headRow.appendChild(header);
	}
	
	const body = document.createElement("tbody");
	table.appendChild(body);
	data.shift();
	for(let rowData of data)
	{
		const row = document.createElement("tr");
		body.appendChild(row);
		for(let point of rowData)
		{
			const tableElem = document.createElement("td");
			row.appendChild(tableElem);
			tableElem.appendChild(createTextSpan(point));
		}
	}
	
	tile.appendChild(table);
	return;
}

export function Contracts_pre(tile, parameters, result)
{
	clearChildren(tile);
	if(!result["PMMGExtended"]["username"])
	{
		tile.textContent = "Error! Missing Username!";
		return;
	}
	if(!result["PMMGExtended"]["apikey"])
	{
		tile.textContent = "Error! Missing API Key!";
		return;
	}
	XITWebRequest(tile, parameters, Contracts_post, "https://rest.fnar.net/contract/allcontracts/" + result["PMMGExtended"]["username"], "GET", ["Authorization", result["PMMGExtended"]["apikey"]], undefined);
	return;
}

function Contracts_post(tile, parameters, jsondata)
{
	if(jsondata == undefined || jsondata == null) { return; }

	var contractData;
	try {
		contractData = JSON.parse(jsondata);
	} catch(SyntaxError) {
		tile.textContent = "Error! Could Not Load Data!";
		return;
	}
	
	const invalidContractStatus = [
		"FULFILLED",
		"BREACHED",
		"TERMINATED",
		"CANCELLED",
		"REJECTED"
	];

	const validContracts = {
		buying: [] as any,
		selling: [] as any,
		shipping: [] as any
	};

	contractData.map(contract => {
		if (!invalidContractStatus.includes(contract["Status"])){
			let viewingParty = contract["Party"];

			if (contract["Conditions"].length === 2 || contract["Conditions"].length === 3) {
				let viewingPartyConditionType = contract["Conditions"].map(condition => {
					if (condition["Party"] === viewingParty)
						return condition;
				}).filter(x => x !== undefined)[0]["Type"];

				let conditions = [] as any;
				for (let conditionType of [contract["Conditions"].length == 2 ? "DELIVERY" : "PROVISION", "PAYMENT", "COMEX_PURCHASE_PICKUP"])
				{
					
					contract["Conditions"].forEach(condition => {
						if(condition["Type"] === conditionType)
						{
							conditions.push(condition);
							return;
						}
					});
				}
				contract["Conditions"] = conditions;

				if (viewingPartyConditionType === "PAYMENT") {
					validContracts["buying"].push(contract);
				}
				else if (viewingPartyConditionType === "DELIVERY" || viewingPartyConditionType === "PROVISION") {
					validContracts["selling"].push(contract);
				}
					
			} else if (contract["Conditions"].length === 4) {
				let conditions = [] as any;
				for (let conditionType of ["SHIPMENT_PROVISION", "PAYMENT", "SHIPMENT_PICKUP", "SHIPMENT_DELIVERY"])
				{
					contract["Conditions"].forEach(condition => {
						if(condition["Type"] === conditionType)
						{
							conditions.push(condition);
							return;
						}
					});
				}
				contract["Conditions"] = conditions;

				validContracts["shipping"].push(contract);
			}

			return contract;
		}
	}).filter(x => x !== undefined);

	validContracts["buying"].sort(ContractSort);
	validContracts["selling"].sort(ContractSort);
	validContracts["shipping"].sort(ContractSort);
	
	const buyTable = createTable(tile, ["Material", "Name", "Partner", "Fulfilled", "Provis.", "Paid", "Pick Up"], "Buying");	
	if (validContracts["buying"].length === 0){
		const line = CreateNoContractsRow(7);
		buyTable.appendChild(line);
	} else {
		validContracts["buying"].forEach(contract => {		
			const line = CreateContractRow(contract);
			buyTable.appendChild(line);
		});
	}

	const sellTable = createTable(tile, ["Material", "Name", "Partner", "Fulfilled", "Provis.", "Paid", "Pick Up"], "Selling");	
	if (validContracts["selling"].length === 0){
		const line = CreateNoContractsRow(7);
		sellTable.appendChild(line);
	} else {
		validContracts["selling"].forEach(contract => {	
			const line = CreateContractRow(contract);
			sellTable.appendChild(line);
		});
	}	
	
	const shipTable = createTable(tile, ["Material", "Name", "Partner", "Fulfilled", "Provis.", "Paid", "Pick Up", "Deliver"], "Shipping");	
	if (validContracts["shipping"].length === 0){
		const line = CreateNoContractsRow(8);
		shipTable.appendChild(line);
	} else {
		validContracts["shipping"].forEach(contract => {
			const conditions = contract["Conditions"];

			const line = document.createElement("tr");
			shipTable.appendChild(line);

			const materialColumn = document.createElement("td");
			materialColumn.style.width = "32px";
			materialColumn.style.paddingLeft = "10px";

			const matElem = createMaterialElement(conditions[0]["Party"] === "CUSTOMER" ? conditions[0]["MaterialTicker"] : "SHPT", "prun-remove-js", conditions[0]["Party"] === "CUSTOMER" ? conditions[0]["MaterialAmount"] : "none", false, true);
			if(matElem){materialColumn.appendChild(matElem);}
			line.appendChild(materialColumn);

			const nameColumn = document.createElement("td");
			nameColumn.appendChild(createLink(contract["Name"] || contract["ContractLocalId"], "CONT " + contract["ContractLocalId"]));
			line.appendChild(nameColumn);

			const partnerColumn = document.createElement("td");
			partnerColumn.appendChild(createLink(contract["PartnerName"], "CO " + contract["PartnerCompanyCode"]));
			line.appendChild(partnerColumn);

			const pending = (conditions[0]["Party"] === "CUSTOMER" ? conditions[0]["Status"] === "FULFILLED" && conditions[1]["Status"] === "FULFILLED" : conditions[2]["Status"] === "FULFILLED" && conditions[3]["Status"] === "FULFILLED");
			const pendingColumn = document.createElement("td");
			const pendingCheck = createTextSpan("⬤");
			pendingCheck.style.color = pending ? TextColors.Success : TextColors.Failure;
			pendingCheck.style.fontWeight = "bold";
			pendingColumn.style.textAlign = "center";
			pendingColumn.appendChild(pendingCheck);
			line.appendChild(pendingColumn);

			const provColumn = document.createElement("td");
			const provCheck = createTextSpan(conditions[0]["Status"] === "FULFILLED" ? "✓" : "X");
			provCheck.style.color = conditions[0]["Status"] === "FULFILLED" ? TextColors.Success : TextColors.Failure;
			provCheck.style.fontWeight = "bold";
			provColumn.style.textAlign = "center";
			provColumn.appendChild(provCheck);
			line.appendChild(provColumn);

			const payColumn = document.createElement("td");
			const payCheck = createTextSpan(conditions[1]["Status"] === "FULFILLED" ? "✓" : "X");
			payCheck.style.color = conditions[1]["Status"] === "FULFILLED" ? TextColors.Success : TextColors.Failure;
			payCheck.style.fontWeight = "bold";
			payColumn.style.textAlign = "center";
			payColumn.appendChild(payCheck);
			line.appendChild(payColumn);

			const pickUp = document.createElement("td");
			const pickUpCheck = createTextSpan(conditions[2]["Status"] === "FULFILLED" ? "✓" : "X");
			pickUpCheck.style.color = conditions[2]["Status"] === "FULFILLED" ? TextColors.Success : TextColors.Failure;
			pickUpCheck.style.fontWeight = "bold";
			pickUp.style.textAlign = "center";
			pickUp.appendChild(pickUpCheck);
			line.appendChild(pickUp);

			const delivColumn = document.createElement("td");
			const delivCheck = createTextSpan(conditions[3]["Status"] === "FULFILLED" ? "✓" : "X");
			delivCheck.style.color = conditions[3]["Status"] === "FULFILLED" ? TextColors.Success : TextColors.Failure;
			delivCheck.style.fontWeight = "bold";
			delivColumn.style.textAlign = "center";
			delivColumn.appendChild(delivCheck);
			line.appendChild(delivColumn);
		});
	}
	
	return parameters;
}

const CreateNoContractsRow = (colspan) => {
	var line = document.createElement("tr");
	const textColumn = document.createElement("td");
	textColumn.setAttribute('colspan', `${colspan}`);
	textColumn.textContent = "No contracts";
	line.appendChild(textColumn);
	return line;
}

function CreateContractRow(contract) {
	const conditions = contract["Conditions"];

	var line = document.createElement("tr");
	

	const materialColumn = document.createElement("td");
	materialColumn.style.width = "32px";
	materialColumn.style.paddingLeft = "10px";

	const matElem = createMaterialElement(conditions[0]["MaterialTicker"], "prun-remove-js", conditions[0]["MaterialAmount"], false, true);
	if(matElem){materialColumn.appendChild(matElem);}
	line.appendChild(materialColumn);

	const nameColumn = document.createElement("td");
	nameColumn.appendChild(createLink(contract["Name"] || contract["ContractLocalId"], "CONT " + contract["ContractLocalId"]));
	line.appendChild(nameColumn);

	const partnerColumn = document.createElement("td");
	partnerColumn.appendChild(createLink(contract["PartnerName"], "CO " + contract["PartnerCompanyCode"]));
	line.appendChild(partnerColumn);

	const pendingColumn = document.createElement("td");
	const pendingCheck = createTextSpan("⬤");
	let viewersCondition = conditions[0]["Party"] === contract["Party"] ? conditions[0] : conditions[1];
	pendingCheck.style.color = viewersCondition["Status"] === "FULFILLED" ? TextColors.Success : TextColors.Failure;
	pendingCheck.style.fontWeight = "bold";
	pendingColumn.style.textAlign = "center";
	pendingColumn.appendChild(pendingCheck);
	line.appendChild(pendingColumn);

	const provColumn = document.createElement("td");
	const provCheck = createTextSpan(conditions[0]["Status"] === "FULFILLED" ? "✓" : "X");
	provCheck.style.color = conditions[0]["Status"] === "FULFILLED" ? TextColors.Success : TextColors.Failure;
	provCheck.style.fontWeight = "bold";
	provColumn.style.textAlign = "center";
	provColumn.appendChild(provCheck);
	line.appendChild(provColumn);

	const payColumn = document.createElement("td");
	const payCheck = createTextSpan(conditions[1]["Status"] === "FULFILLED" ? "✓" : "X");
	payCheck.style.color = conditions[1]["Status"] === "FULFILLED" ? TextColors.Success : TextColors.Failure;
	payCheck.style.fontWeight = "bold";
	payColumn.style.textAlign = "center";
	payColumn.appendChild(payCheck);
	line.appendChild(payColumn);

	const pickUp = document.createElement("td");
	const pickUpCheck = createTextSpan(conditions.length == 3 ? (conditions[2]["Status"] === "FULFILLED" ? "✓" : "X") : "");
	pickUpCheck.style.color = conditions[2] == undefined || conditions[2]["Status"] === "FULFILLED" ? TextColors.Success : TextColors.Failure;
	pickUpCheck.style.fontWeight = "bold";
	pickUp.style.textAlign = "center";
	pickUp.appendChild(pickUpCheck);
	line.appendChild(pickUp);

	return line;
};

function ContractSort(a, b)
{
	return a["DueDateEpochMs"] > b["DueDateEpochMs"] ? 1 : -1;
}

export function PRuN_pre(tile)
{
	clearChildren(tile);
	const prun = document.createElement("iframe");
		prun.src = "https://apex.prosperousuniverse.com/#/";
		prun.width = "100%";
		prun.height = "100%";
		prun.style.borderWidth = "0";
	tile.appendChild(prun);
	return;
}

export function Prosperity_pre(tile, parameters)
{
	clearChildren(tile);
	var url = "https://prosperity-prun.netlify.app/";
	if(parameters.length == 3)
	{
		url += "?from=" + parameters[1] + "&to=" + parameters[2];
	}
	
	const prosp = document.createElement("iframe");
		prosp.src = url;
		prosp.width = "100%";
		prosp.height = "100%";
		prosp.style.borderWidth = "0";
	tile.appendChild(prosp);
	return;
}

export function Sheets_pre(tile, parameters)
{
	clearChildren(tile);
	if(parameters.length < 2)
	{
		tile.textContent = "Error! Not Enough Parameters!";
		return;
	}
	for(var i = 2; i < parameters.length; i++)
	{
		parameters[1] += "_" + parameters[i];
	}
	const sheet = document.createElement("iframe");
		sheet.src = "https://docs.google.com/spreadsheets/d/" + parameters[1] + "/edit?usp=sharing";
		sheet.style.borderWidth = "0";
		sheet.style.height = "100%";
		sheet.style.width = "100%";
	tile.appendChild(sheet);
	return;
}

export function Discord_pre(tile, parameters)
{
	clearChildren(tile);
	var serverID;
	var channelID;
	if(parameters.length == 2)
	{
		if(DiscordServers[parameters[1]] == undefined)
		{
			tile.textContent = "Error! Not Enough Parameters";
			return;
		}
		else
		{
			serverID = DiscordServers[parameters[1]][0];
			channelID = DiscordServers[parameters[1]][1];
		}
	}
	else if(parameters.length > 2)
	{
		serverID = parameters[1];
		channelID = parameters[2];
	}
	else
	{
		tile.textContent = "Error! Not Enough Parameters";
		return;
	}
	const discord = document.createElement("iframe");
		discord.src = "https://e.widgetbot.io/channels/" + serverID + "/" + channelID;
		discord.width = "100%";
		discord.height = "100%";
		discord.style.borderWidth = "0px";
				
	tile.appendChild(discord);
	return;
}

export function FIOInv_pre(tile, parameters, result)
{
	clearChildren(tile);
	const apikey = result["PMMGExtended"]["apikey"];
	if(parameters.length < 2)
	{
		tile.textContent = "Error! Not Enough Parameters!";
		return;
	}
	
	if(parameters.length == 2)
	{
		parameters.push(apikey);
		XITWebRequest(tile, parameters, FIOInv_getAllStorages, "https://rest.fnar.net/auth/group/" + parameters[1], "GET", ["Authorization", apikey], undefined);
	}
	else
	{
		for(var i = 3; i < parameters.length; i++)	// Allow for spaces in planet names
		{
			parameters[2] += " " + parameters[i];
		}
		
		XITWebRequest(tile, parameters, FIOInv_post, "https://rest.fnar.net/storage/" + parameters[1] + "/" + parameters[2], "GET", ["Authorization", apikey], undefined);
	}
	return;
}

function FIOInv_post(tile, parameters, jsondata)
{
	const tag = "FIO";
	if(jsondata == undefined || jsondata == null){return;}
	var inventoryData;
	try
	{
		inventoryData = JSON.parse(jsondata);
	}
	catch(SyntaxError)
	{
		tile.textContent = "Error! Could Not Load Data!";
		return;
	}
	const volumeUsed = inventoryData["VolumeLoad"];
	const volumeTotal = inventoryData["VolumeCapacity"];
	const weightUsed = inventoryData["WeightLoad"];
	const weightTotal = inventoryData["WeightCapacity"];
	
	const header = document.createElement("div");
	header.classList.add("inv-header");
	header.id = "header";
	header.classList.add(tag);
	
	tile.appendChild(header);
	const body = document.createElement("div");
	tile.appendChild(body);
	body.classList.add(tag);
	body.classList.add("inv-body");
	body.id = "body";
	
	
	header.appendChild(createTextSpan(parameters[2], tag));
	header.appendChild(document.createElement("br"));
	const userElem = createTextSpan(parameters[1], tag);
	userElem.style.paddingLeft = "8px";
	header.appendChild(userElem);
	
	const volumeLine = document.createElement("div");
	volumeLine.id = "volume-line";
	volumeLine.style.padding = "2px 8px";
	volumeLine.style.color = "#999999";
	volumeLine.appendChild(createTextSpan("Volume ", tag));
	const volumeBar = document.createElement("progress");
	volumeBar.id = "volume-bar";
	volumeBar.classList.add(tag);
	volumeBar.classList.add("progress-bar");
	volumeBar.max = 1;
	volumeBar.value = volumeUsed / volumeTotal;
	volumeLine.appendChild(volumeBar);
	volumeLine.appendChild(createTextSpan(volumeUsed.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) + " / " + volumeTotal.toLocaleString(undefined, {maximumFractionDigits: 0, minimumFractionDigits: 0}) + " m³", tag));
	
	header.appendChild(volumeLine);
	
	const weightLine = document.createElement("div");
	weightLine.id = "weight-line";
	weightLine.style.padding = "2px 8px";
	weightLine.style.color = "#999999";
	weightLine.appendChild(createTextSpan("Weight ", tag));
	const weightBar = document.createElement("progress");
	weightBar.id = "weight-bar";
	weightBar.classList.add(tag);
	weightBar.classList.add("progress-bar");
	weightBar.max = 1;
	weightBar.value = weightUsed / weightTotal;
	weightLine.appendChild(weightBar);
	weightLine.appendChild(createTextSpan(weightUsed.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2}) + " / " + weightTotal.toLocaleString(undefined, {maximumFractionDigits: 0, minimumFractionDigits: 0}) + " t", tag));
	
	header.appendChild(weightLine);
	inventoryData["StorageItems"].sort(fioMatsAlphabetSort);
	for(let item of inventoryData["StorageItems"])
	{
		const mat = createMaterialElement(item["MaterialTicker"], tag, item["MaterialAmount"], true);
		if(mat)
		{body.appendChild(mat);}
	}
	return;
}

function FIOInv_getAllStorages(tile, parameters, jsondata)
{
	var userJSON;
	try
	{
		userJSON = JSON.parse(jsondata);
	} catch(SyntaxError)
	{
		tile.textContent = "Error! Bad Data from FIO!";
	}
	var usernames = [] as string[];
	userJSON["GroupUsers"].forEach(user => {
		usernames.push(user["GroupUserName"]);
		return;
	});
	
	parameters.push(userJSON["GroupName"]);
	
	XITWebRequest(tile, parameters, FIOInv_allDisplay, "https://rest.fnar.net/fioweb/grouphub", "POST", ["Authorization", parameters[2]], JSON.stringify(usernames));
	return;
}

function FIOInv_allDisplay(tile, parameters, jsondata)
{
	var groupData = [];
	try
	{
		groupData = JSON.parse(jsondata);
	} catch(SyntaxError)
	{
		tile.textContent = "Error! Bad Data from FIO!";
	}
	const titleDiv = document.createElement("div");
	titleDiv.classList.add("title");
	titleDiv.appendChild(createTextSpan(parameters[3] + " Inventories"));
	tile.appendChild(titleDiv);
	const bodyDiv = document.createElement("div");
	tile.appendChild(bodyDiv);
	bodyDiv.classList.add("flex-table");
	
	if(groupData["PlayerModels"] == undefined){tile.textContent = "Error! Bad Data!"; return;}
	
	groupData["PlayerModels"].forEach(player => {
		if(player["Locations"].length == 0){return;}
		const playerDiv = document.createElement("div");
		playerDiv.classList.add("list");
		playerDiv.appendChild(createTextSpan(player["UserName"]));
		(playerDiv.firstChild as HTMLElement).style.fontWeight = "bold";
		player["Locations"].forEach(location => {
			playerDiv.appendChild(createLink(location["LocationName"], "XIT INV_" + player["UserName"] + "_" + location["LocationName"].replace(/ /, "_")));
			return;
		});
		
		bodyDiv.appendChild(playerDiv);
		return;
	});
	parameters.pop();
	parameters.pop();
	return;
}

function fioMatsAlphabetSort(a, b)
{
	if(a["MaterialCategory"] == null || b["MaterialCategory"] == null){return 0;}
	return a["MaterialCategory"].localeCompare(b["MaterialCategory"]);
}