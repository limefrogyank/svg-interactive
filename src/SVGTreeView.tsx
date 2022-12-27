import { Component } from 'react'
import { ITreeItemData } from './TreeView/ITreeItemData';
import Tree from './TreeView/Tree';


interface ISVGTreeViewProps{
	svgElement:Element|null;
	selectedElementChanged?: (element: Element|null, data:ITreeItemData|null) => void;
}

class SVGTreeView extends Component<ISVGTreeViewProps> {

	selectedButton: HTMLButtonElement|null = null;
	selectedData: ITreeItemData|null=null;

	buttonClick = (ev: React.MouseEvent<HTMLButtonElement,MouseEvent>, data: ITreeItemData|null) => {
		if (this.selectedButton != null){
			this.selectedButton.classList.remove('active');
		}

		this.selectedButton = ev.currentTarget;
		this.selectedButton.classList.add('active');

		this.selectedData = data;

		if (this.props.selectedElementChanged != null) {
			this.props.selectedElementChanged(this.selectedButton, data);
		}
		
	}

	parseElementChildren(element: Element) : ITreeItemData[] | null {
		let data :ITreeItemData[] = [];
		for (let i=0; i<element.children.length; i++){
			let child = element.children.item(i);
			if (child !== null && child.tagName != 'script' && child.tagName != 'style' && child.id !== null && child.id !== ''){
				let item: ITreeItemData = {
					name: element.id,
					element: element
				};
				if (child.children != null && child.children.length > 0){
					let subData = this.parseElementChildren(child);
					if (subData != null){
						item.children = subData;
					}
				}
				data.push(item);

			}
		}
		if (data.length > 0){
			return data;
		} else {
			return null;
		}
	}

	render() {
		if (this.props.svgElement === null){
			return <div></div>;
		}	

		let data :ITreeItemData[] =[];
		let svgNode: Element|null = this.props.svgElement;
		
		if (svgNode != null){
			for (let i=0; i<svgNode.children.length; i++){
			 	let element = svgNode.children.item(i);
			 	if (element !== null && element.tagName != 'script' && element.tagName != 'style' && element.id !== null && element.id !== ''){
					let item: ITreeItemData = {
						name: element.id,
						element:element
					};
					if (element.children != null && element.children.length > 0){
						let subData = this.parseElementChildren(element);
						if (subData != null){
							item.children = subData;
						}
					}
					data.push(item);
			 	}
			}
		}
	  return (
	  <>
	  	<Tree selectionEvent={(ev,data)=> this.buttonClick(ev, data)} children={data}></Tree>

	  </>
	  );
	}

	// sampleData():ITreeItemData[]{
			
	// 	let data :ITreeItemData[] = [
	// 		{
	// 			name: 'First',
	// 			children: [
	// 				{
	// 					name: "1-1",
	// 					children: [
	// 						{
	// 							name: 'Last',
	// 							children: [
	// 								{
	// 									name: "1-1"
	// 								},
	// 								{
	// 									name: "1-2"
	// 								},
	// 								{
	// 									name: "1-3"
	// 								},
	// 							]
	// 						},
	// 					]
	// 				},
	// 				{
	// 					name: "1-2"
	// 				},
	// 				{
	// 					name: "1-3"
	// 				},
	// 			]
	// 		},
	// 		{
	// 			name: 'First',
	// 			children: [
	// 				{
	// 					name: "1-1"
	// 				},
	// 				{
	// 					name: "1-2"
	// 				},
	// 				{
	// 					name: "1-3"
	// 				},
	// 			]
	// 		},
	// 		{
	// 			name: 'First',
	// 			children: [
	// 				{
	// 					name: "1-1"
	// 				},
	// 				{
	// 					name: "1-2"
	// 				},
	// 				{
	// 					name: "1-3"
	// 				},
	// 			]
	// 		}
	// 	];
	// 	return data;
	// }
  }

export default SVGTreeView;