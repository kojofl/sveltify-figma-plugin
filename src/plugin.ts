figma.showUI(__html__);

let current_node: SceneNode | undefined = undefined;

figma.on("selectionchange", async () => {
	const nodes = figma.currentPage.selection;
	if (nodes.length > 0) {
		current_node = nodes[0];
		figma.ui.postMessage({ type: "control", target: current_node.type + " " + current_node.id })
	} else {
		current_node = undefined;
		figma.ui.postMessage({ type: "control", target: "" });
	}
})

figma.ui.onmessage = async (msg) => {
	let node;
	switch (msg.type) {
		case "css_request":
			node = figma.getNodeById(msg.id);
			if (!node) {
				figma.ui.postMessage({ type: "no_data" });
				return
			}
			const css = await node.getCSSAsync();
			figma.ui.postMessage({ type: "css_response", data: css });
			return;
		case "svg_request":
			node = figma.getNodeById(msg.id);
			if (!node) {
				figma.ui.postMessage({ type: "no_data" });
				return
			}
			try {
				const svg = await (node as SceneNode).exportAsync({ format: "SVG_STRING" });
				figma.ui.postMessage({ type: "svg_response", data: svg });
			} catch (e) {
				figma.ui.postMessage({ type: "no_data" });
			}
			return;
		case "init":
			if (current_node) {
				const file_key = figma.fileKey;
				const token = msg.token;
				figma.ui.postMessage({ type: "start", file_key, token, id: current_node!.id });
			} else {
				figma.notify("No node selected");
			}
			return;
		case "finished":
			figma.ui.postMessage({ type: "control", target: "finished" });
		default:
			figma.notify(`Something went wrong unknown message`);

	}
};



