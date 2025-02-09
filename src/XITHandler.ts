import {Module} from "./ModuleRunner";
import {getBuffers, createTextSpan} from "./util";
import {Selector} from "./Selector";
import {Start} from "./XIT/Start";
import {Settings} from "./XIT/Settings";
import {Debug} from "./XIT/Debug";
import {Calculator} from "./XIT/Calculator";
import {Repairs_pre} from "./XIT/Repairs";
import {Chat_pre} from "./XIT/Chat";
import {Fin_pre} from "./XIT/Finances";
import {EnhancedBurn_pre} from "./XIT/Burn";
import {Contracts_pre} from "./XIT/Contracts";
import {PRuN_pre, Prosperity_pre, Sheets_pre, Discord_pre, PrunPlanner, Wiki, FIO} from "./XIT/Web";
import {FIOInv_pre} from "./XIT/Inventory";
import {Notes} from "./XIT/Notes";
import {Checklists} from "./XIT/Checklists";
import {Sort} from "./XIT/Sort";
import {CommandLists} from "./XIT/CommandLists";
import {Help} from "./XIT/Help";
import {DataHealth} from "./XIT/DataHealth";

export const XITPreFunctions = {
	"INV": FIOInv_pre,
	"DISCORD": Discord_pre,
	"SHEETS": Sheets_pre,
	"PROSPERITY": Prosperity_pre,
	"PRUN": PRuN_pre,
	"FIN": Fin_pre,
	"CHAT": Chat_pre,
	"BURN": EnhancedBurn_pre,
	"SETTINGS": Settings,
	"CONTRACTS": Contracts_pre,
	"REPAIRS": Repairs_pre,
	"CALCULATOR": Calculator,
	"CALC": Calculator,
	"START": Start,
	"DEBUG": Debug,
	"NOTE": Notes,
	"NOTES": Notes,
	"CHECK": Checklists,
	"CHECKS": Checklists,
	"CHECKLIST": Checklists,
	"CHECKLISTS": Checklists,
	"SORT": Sort,
	"LIST": CommandLists,
	"LISTS": CommandLists,
	"PRUNPLANNER": PrunPlanner,
	"PLANNER": PrunPlanner,
	"WIKI": Wiki,
	"HELP": Help,
	"FIO": FIO,
	"HEALTH": DataHealth
}

export const XITBufferTitles = {
	"INV": "FIO INVENTORY",
	"DISCORD": "DISCORD SERVER",
	"SHEETS": "GOOGLE SHEETS",
	"PROSPERITY": "PROSPERITY",
	"PRUN": "PRUN-CEPTION",
	"FIN": "FINANCIAL OVERVIEW",
	"CHAT": "CHAT",
	"BURN": "ENHANCED BURN",
	"SETTINGS": "PMMG SETTINGS",
	"CONTRACTS": "PENDING CONTRACTS",
	"REPAIRS": "REPAIRS",
	"CALC": "CALCULATOR",
	"CALCULATOR": "CALCULATOR",
	"START": "STARTING WITH PMMG",
	"DEBUG": "DEBUG",
	"NOTE": "NOTE",
	"NOTES": "NOTE",
	"CHECK": "CHECKLIST",
	"CHECKS": "CHECKLIST",
	"CHECKLIST": "CHECKLIST",
	"CHECKLISTS": "CHECKLIST",
	"SORT": "SORTING OPTIONS",
	"LIST": "COMMAND LIST",
	"LISTS": "COMMAND LIST",
	"PRUNPLANNER": "PRUN PLANNER",
	"PLANNER": "PRUN PLANNER",
	"WIKI": "PRUN WIKI",
	"HELP": "PMMG HELP",
	"FIO": "FIO",
	"HEALTH": "DATA HEALTH"
}
/**
 * Handle XIT buffers
 */
export class XITHandler implements Module {
  private tag = "pb-xit";
  private webData;
  private modules;
  private result;
  private browser;
  private userInfo;
  
  constructor(result, userInfo, webData, modules, browser)
  {  
	this.userInfo = userInfo;
	this.webData = webData;
	this.modules = modules;
	this.result = result;
	this.browser = browser;
  }
  cleanup() {
    //genericCleanup(this.tag);	// Don't clean up because causes flashing when doing asynchronous requests
  }
  run() {
    const buffers = getBuffers("XIT");
    if (!buffers) return;
	const webData = this.webData;
	const userInfo = this.userInfo;
	buffers.forEach(buffer => {
		const tile = (buffer.querySelector(Selector.XITTile)) as HTMLElement;
		if(!tile){return;}
		
		if(tile.firstChild && ((tile.firstChild as HTMLElement).id == "pmmg-load-success" || (tile.firstChild as HTMLElement).id == "pmmg-no-match")){return;}
		
		const parametersRaw = Array.from(buffer.getElementsByClassName(Selector.BufferHeader))[0].textContent;
		
		if(!parametersRaw) return;
		var parameters = [] as string[];
		if(parametersRaw.charAt(4) == "1")
		{
			const keyValues = parametersRaw.slice(4).split(" ");
			keyValues.forEach(key => {
				parameters.push(key.slice(2));
				return;
			});
		}
		else
		{
			parameters = parametersRaw.slice(4).split("_");
		}
		if(!parameters) return;
		for(var i = 0; i < parameters.length; i++)
		{
			parameters[i] = parameters[i].trim()
		}
		
		if(tile.firstChild && (tile.firstChild as HTMLElement).id == "pmmg-reload"){XITPreFunctions[parameters[0].toUpperCase()](tile.firstChild, parameters, this.result, userInfo, webData, this.modules, false);return;}
		
		tile.classList.add("xit-tile");
		if(tile.firstChild)
		{
			(tile.firstChild as HTMLElement).style.backgroundColor = "#222222";
		}
		
		const refreshButton = document.createElement("div");
		if(!tile.firstChild || (tile.firstChild && ((tile.firstChild as HTMLElement).id != "pmmg-no-match")))
		{
				if(buffer.getElementsByClassName("refresh").length == 0)
				{
					refreshButton.appendChild(createTextSpan("⟳"));
					refreshButton.classList.add("button-upper-right");
					refreshButton.classList.add(this.tag);
					refreshButton.style.fontSize = "16px";
					refreshButton.style.paddingTop = this.browser == "chromium" ? "12px" : "7px";
					refreshButton.classList.add("refresh");
					(buffer.children[3] || buffer.children[2]).insertBefore(refreshButton, (buffer.children[3] || buffer.children[2]).firstChild);
				}
		}
		const contentDiv = document.createElement("div");
			contentDiv.style.height = "100%";
			contentDiv.style.flexGrow = "1";
		
		tile.appendChild(contentDiv);
		
		const preFunc = XITPreFunctions[parameters[0].toUpperCase()];
		if(!preFunc)
		{
			tile.textContent = "Error! No Matching Function!";
			if(!tile.firstChild){return;}
			(tile.firstChild as HTMLElement).id = "pmmg-no-match";
		}
		else
		{
			Array.from(buffer.querySelectorAll(Selector.BufferTitle))[0].textContent = XITBufferTitles[parameters[0].toUpperCase()];	// Title the buffer
			const modules = this.modules;
			var result = this.result;
			refreshButton.addEventListener("click", function(){preFunc(contentDiv, parameters, result, userInfo, webData, modules, true);});
			(tile.firstChild as HTMLElement).id = "pmmg-load-success";
			preFunc(contentDiv, parameters, this.result, userInfo, webData, modules, false);
		}
		return;
		
	});
	return;
  }
  
  
}
