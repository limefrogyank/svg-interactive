import { Component, RefObject, createRef } from 'react'

interface ISVGComponentProps{
	svgElement:Element|null;
}

class SVGComponent extends Component<ISVGComponentProps> {

	divRef: RefObject<HTMLDivElement>=createRef();

	public getSVGHTML(){
		return this.divRef.current?.innerHTML;
	}

	render() {
		if (this.props.svgElement == null){
			return <div>Use the file chooser above to load an SVG</div>;
		}	
		return (
		<>
			<div ref={this.divRef} style={{height: '100%'}} dangerouslySetInnerHTML={{ __html: this.props.svgElement == null ? '<div>test</div>' : this.props.svgElement.outerHTML }}></div>
		</>
		);
	}

  }

export default SVGComponent;