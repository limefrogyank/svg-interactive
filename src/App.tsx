import React, { ChangeEvent, Component, RefObject, createRef } from 'react';
import './App.css';
import { readerGetTextAsync } from './promise';
import SVGComponent from './SVGComponent';
import SVGTreeView from './SVGTreeView';
import { ITreeItemData } from './TreeView/ITreeItemData';

interface IAppProps {

}

interface IAppState {
  svgElement: Element | null;
  selectedElement: Element | null;
  description: string;
}

export const DESCRIPTIONCLASSNAME = 'DescriptionBoxInternal';
export const HOVERCLASSNAME = 'FeatureGroup';

class App extends Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
    this.onSVGFileChange.bind(this);
    this.selectedElementChanged.bind(this);
    this.setDescription.bind(this);
    this.makeHover.bind(this);
    this.state = {
      svgElement: null,
      selectedElement: null,
      description: ''
    }

  }

  scriptTag : Element|null = null;
  styleTag : Element|null = null;
  descriptionElement: HTMLParagraphElement|null = null;
  hoverElements: Element[] = [];
  fileName:string = '';
  svgComponent: RefObject<SVGComponent> = createRef();

  onSVGFileSave = () =>{
    if (this.state.svgElement == null){
      return;
    }
    const data = this.svgComponent.current?.getSVGHTML();
    if (data === undefined){
      return;
    }
    const file = new Blob([data], {type:'text'});

    let a = document.createElement('a');
    let url = URL.createObjectURL(file);
    a.href=url;
    a.download = this.fileName + '.modded.svg';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=> {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
  }

  onSVGFileChange = async (args: ChangeEvent) => {
    const files = (args.currentTarget as HTMLInputElement).files;
    const file = files?.item(0);
    if (file != null)
      this.fileName = file.name;

    if (file != null) {
      const reader = new FileReader();

      const result = await readerGetTextAsync(reader, file);
      const parser = new DOMParser();

      let doc = parser.parseFromString(result, "image/svg+xml")
      let svg = this.findTag(doc.children, 'svg');
      if (svg != null){
        this.scriptTag  = this.findTag(svg.children, 'script');

        let styleTags = this.findTags(svg.children, 'style');

        for (let i =0; i< styleTags.length; i++){
          let style = styleTags[i];
          if (style.id === 'feature-group-style'){
            this.styleTag = style;
          }
        }
        if (this.styleTag == null){
          this.styleTag = document.createElement('style');
          this.styleTag.id = 'feature-group-style';
          this.styleTag.innerHTML = this.generateStyleContents();
          svg.insertBefore(this.styleTag, svg.firstChild);
        }

        let descTags = this.findTagsWithClass(svg.children, DESCRIPTIONCLASSNAME);
        if (descTags.length > 0){
          this.descriptionElement = descTags[0].getElementsByTagName('p')[0];
        }

        this.hoverElements = this.findTagsWithClass(svg.children, HOVERCLASSNAME)
        
        
      }
      this.setState({ svgElement: svg });
    }

  };

  generateStyleContents():string{
    return `
    @media print{#printKey{display: inline;}}
    .${HOVERCLASSNAME} {opacity:0;} 
    *:focus {outline: 0px solid transparent;} 
    .${HOVERCLASSNAME}:hover {
      opacity:0.5;
      transition: opacity 0.2s; 
    } 
    .${HOVERCLASSNAME}:focus {
      opacity:1;
      transition: opacity 0.2s; 
    } 
    .Description {font-size: 16px; font-family: Roboto-MediumItalic, Roboto; background-color: #F0FAFF; padding: 10px;} 
    @media print{.FeatureGroup {opacity:1;}
    `;
  }

  findTag(children: HTMLCollection, tagName:string) : Element | null {
    let element: Element | null = null;
    for (let i = 0; i < children.length; i++) {
      if (children.item(i)?.tagName === tagName) {
        element = children.item(i);
      }
    }
    return element;
  }
  findTags(children: HTMLCollection, tagName:string) : Element[] {
    let elements: Element[] = [];
    for (let i = 0; i < children.length; i++) {
      if (children.item(i)?.tagName === tagName) {
        elements.push(children.item(i)!);
      }
    }
    return elements;
  }
  findTagsWithClass(children: HTMLCollection, className:string) : Element[] {
    let elements: Element[] = [];
    for (let i = 0; i < children.length; i++) {
      if (children.item(i)!.classList.contains(className)) {
        elements.push(children.item(i)!);
      }
    }
    return elements;
  }

  selectedElementChanged(origin:Element|null, data: ITreeItemData|null){
    if (data != null){
      let desc = '';
      let descElement = this.findTag(data.element.children, 'desc');
      if (descElement != null){
        desc = descElement.innerHTML;
      } 

      this.setState({
        selectedElement: data.element,
        description: desc
      });
    }
  }

  setDescription(){
    if (this.state.selectedElement == null){
      return;
    }
    // check that element contains a 'rect'
    let rect = this.state.selectedElement.firstElementChild;
    if (rect?.tagName === 'rect'){
      if (!this.state.selectedElement.classList.contains(DESCRIPTIONCLASSNAME)){
        this.state.selectedElement.classList.add(DESCRIPTIONCLASSNAME);
      }
      let ns = 'http://www.w3.org/2000/svg';
      let foreignObject = document.createElementNS(ns,'foreignObject');
      for (let i = 0; i < rect.attributes.length; i++){
        foreignObject.setAttribute(rect.attributes[i].name, rect.attributes[i].value);
      }
      rect.remove();
      this.state.selectedElement.appendChild(foreignObject);
      let p = document.createElement('p');
      foreignObject.appendChild(p);
      p.id = 'DescriptionBoxInnerId';
      p.ariaLive = 'assertive';
      p.className = 'Description';
      p.innerText = 'Select any item for more information.';
      this.descriptionElement = p;
    } else if(rect?.tagName === 'foreignObject') {
      if (!this.state.selectedElement.classList.contains(DESCRIPTIONCLASSNAME)){
        this.state.selectedElement.classList.add(DESCRIPTIONCLASSNAME);
      }
    }

    for (let i=0; i<this.hoverElements.length; i++){
      this.setHandlersForHoverElements(this.hoverElements[i] as SVGElement);
    }
    this.forceUpdate();
  }

  onDescChanged(ev: React.FormEvent<HTMLTextAreaElement>){
    if (this.state.selectedElement == null){
      return;
    }
    let newValue = ev.currentTarget.value;
    let descElement = this.findTag(this.state.selectedElement.children, 'desc');
    if (descElement != null){
      descElement.innerHTML = newValue;
    } else {
      descElement = document.createElement('desc');
      descElement.ariaHidden='true';
      descElement.innerHTML = newValue;
      this.state.selectedElement.appendChild(descElement);

    }
    this.setState({description: newValue});
  }

  makeHover(){
    if (this.state.selectedElement == null){
      return;
    }
    //tabindex="0" onkeypress="displayDescription(this)" onclick="displayDescription(this), focus()" focusable="true" class="FeatureGroup"
    const element = this.state.selectedElement;
    this.hoverElements.push(element);
    element.setAttribute('tabindex', '0');
    element.setAttribute('focusable', 'true');
    if (!element.classList.contains(HOVERCLASSNAME))
      element.classList.add(HOVERCLASSNAME);
    this.setHandlersForHoverElements(element as SVGElement);
    this.forceUpdate();
  }

  setHandlersForHoverElements(element: SVGElement){
    if (this.descriptionElement == null){
      element.setAttribute('onclick', `
      focus();
    `);
    }else {
      element.setAttribute('onclick', `
        document.getElementById('${this.descriptionElement.id}').innerText = this.getElementsByTagName('desc')[0].innerHTML;
        focus();
      `);
      element.setAttribute('onkeypress', `
        document.getElementById('${this.descriptionElement.id}').innerText = this.getElementsByTagName('desc')[0].innerHTML;
      `)
    }
  }

  render() {
    return (
      <div className="App" style={{ height: '100vh' }}>
        <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>

          <div id='top-panel' style={{ height: '25%'}}>
            <div className="input-group mb-3" >
              <label className="input-group-text" htmlFor="inputGroupFile01">Load SVG</label>
              <input type="file" className="form-control" id="inputGroupFile01" onChange={this.onSVGFileChange} />
              <button className="form-control btn btn-primary" id="inputGroupFile02" onClick={this.onSVGFileSave} >Save</button>
            </div>

            <button className='btn btn-secondary' disabled={this.state.selectedElement == null ? true : false}
              onClick={()=>this.setDescription()}
              >Set Description</button>

            <button className='btn btn-secondary' disabled={this.state.selectedElement == null ? true : false}
              onClick={()=>this.makeHover()}
              >Make Hover</button>

            <textarea className="form-control" id="exampleFormControlTextarea1" rows={3} 
              value={this.state.description} onInput={(ev)=>this.onDescChanged(ev)}/>

          </div>

          <div id='rest-of-page' style={{ display: 'flex', height: '75%', flexDirection: 'row' }}>
            
            <div id='left-column' style={{width:'auto', maxWidth: '300px', flex: '0 1 300px', display: 'flex', flexDirection: 'column', height: '100%' }}>

              <div style={{ overflowY: 'auto' }}>
                <SVGTreeView svgElement={this.state.svgElement} selectedElementChanged={(ev,data)=>this.selectedElementChanged(ev,data)}></SVGTreeView>
              </div>

              <div style={{ height: '300px', flex: '1 0 0px' }}>
                Testing
              </div>

            </div>

            <div id='right-panel' style={{ flex: '1 0 0px', height: '100%' }} >
              <SVGComponent ref={this.svgComponent} svgElement={this.state.svgElement}></SVGComponent>
              {/* <div style={{height: '100%'}} dangerouslySetInnerHTML={{ __html: this.state.svgElement == null ? '<div>test</div>' : this.state.svgElement.outerHTML }}></div> */}
            </div>

          </div>

        </div>



      </div>
    );
  }
}

export default App;
