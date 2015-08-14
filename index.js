// Set up necessary variables via "require"
var contextMenu = require("sdk/context-menu");
var defaultArchiver = require('sdk/simple-prefs').prefs['defaultArchiver'];
var preferences = require("sdk/simple-prefs").prefs;
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require("sdk/tabs");

require("sdk/simple-prefs").on("defaultArchiver", onDefaultArchiverPreferenceChange);

// Create string constants for the context menu label
var archiveIsLabel = "Save to archive.is";
var waybackMachineLabel = "Save to Wayback Machine";

// Create toggle button for toolbar
var button = ToggleButton({
	id: "my-button",
	label: "my button",
	icon: {
		"16": "./archive-icon-16.png",
		"32": "./archive-icon-32.png",
		"64": "./archive-icon-64.png"
	},
	onChange: handleChange
});

// Create context menu item
var menuItem = contextMenu.Item({
	label: waybackMachineLabel,
	context: contextMenu.PageContext(),
	contentScript: 'self.on("click", function () {' +
				   '	self.postMessage();' +
				   '});',
	onMessage: function () {
		if (defaultArchiver == "archiveIs") {
			handleSaveArchiveIs();
		}
		else {
			handleSaveWaybackMachine();
		}
	}
});

// Create panel to be used in the toggle button
var panel = panels.Panel({
	contentURL: self.data.url("panel.html"),
	contentScriptFile: self.data.url("panel.js"),
	onHide: handleHide,
	width: 250,
	height: 60
});

function handleChange(state) {
	if (state.checked) {
		panel.show({
			position: button
		});
	}
	else {
		panel.hide({
			position: button
		})
	}
}

function handleHide() {
	button.state('window', {checked: false});
}

function handleSaveArchiveIs() {
	panel.hide();
	tabs.open("https://archive.is/?run=1&url=" + tabs.activeTab.url);
}

function handleSaveWaybackMachine() {
	panel.hide();
	tabs.open("https://web.archive.org/save/" + tabs.activeTab.url);
}

function onDefaultArchiverPreferenceChange() {
	defaultArchiver = preferences.defaultArchiver;
	defaultArchiverLabel = (preferences.defaultArchiver == "archiveIs") ? archiveIsLabel : waybackMachineLabel;
	menuItem.label = defaultArchiverLabel;
}

panel.port.on("saveArchiveIs" , function() {
	handleSaveArchiveIs(tabs.activeTab.url);
});

panel.port.on("saveWaybackMachine" , function() {
	handleSaveWaybackMachine(tabs.activeTab.url);
});