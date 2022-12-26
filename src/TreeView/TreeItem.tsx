import React, {Component, createRef, RefObject} from 'react'
import { ITreeItemData } from './ITreeItemData';
import 'bootstrap-icons/font/bootstrap-icons.css'
import { ClassWatcher } from './MutationObserver';
import { DESCRIPTIONCLASSNAME, HOVERCLASSNAME } from '../App';


interface ITreeItemProps{
	item:ITreeItemData;
	// children?: ITreeItemData[];
	index:number;
	id:string;
	selectionEvent: (ev: React.MouseEvent<HTMLButtonElement,MouseEvent>, data: ITreeItemData|null)=>void;
}

class TreeItem extends Component<ITreeItemProps> {
	workOnClassAdd = ()=>{
		this.iRef.current?.classList.remove('bi-chevron-down');
		this.iRef.current?.classList.add('bi-chevron-right');
	};
	workOnClassRemove = ()=>{
		this.iRef.current?.classList.add('bi-chevron-down');
		this.iRef.current?.classList.remove('bi-chevron-right');
	};

	selectButtonRef: RefObject<HTMLButtonElement> = createRef();
	chevronButtonRef: RefObject<HTMLButtonElement> = createRef();
	divRef: RefObject<HTMLDivElement> = createRef();
	iRef: RefObject<HTMLElement> = createRef();
	classWatcher:ClassWatcher|null = null;

	selectedButton: HTMLButtonElement|null = null;

	componentDidMount(){
		if (this.chevronButtonRef.current != null){
			if (this.classWatcher != null){
				this.classWatcher.disconnect();
			}
			this.classWatcher = new ClassWatcher(this.chevronButtonRef.current, 'collapsed', this.workOnClassAdd, this.workOnClassRemove)
		}
	}

	componentWillUnmount(){
		this.classWatcher?.disconnect();
	}

	chevronButtonClick(ev: React.MouseEvent<HTMLButtonElement,MouseEvent>){
		ev.stopPropagation();
	}

	render() {
		if (this.props.item.children === undefined || this.props.item.children.length === 0){
			return (
			<>
				<button onClick={(ev) => this.props.selectionEvent(ev,this.props.item)} type="button" className='list-group-item list-group-item-action object-fit-fill'>
					<span>{this.props.item.name}</span>
					{ this.props.item.element.classList.contains(DESCRIPTIONCLASSNAME) ? <i className='bi-easel position-absolute end-0 pe-2'></i> : <></> }
					{ this.props.item.element.classList.contains(HOVERCLASSNAME) ? <i className='bi-hand-index-thumb position-absolute end-0 pe-2'></i> : <></>}
				</button>
			</>
			)
		} else {
			return (
			<>
				<button onClick={(ev) => this.props.selectionEvent(ev,this.props.item)} type="button" className='list-group-item list-group-item-action d-flex' >
					<div className='me-auto'>
						<button type="button" onClick={(ev) => this.chevronButtonClick(ev)} ref={this.chevronButtonRef} className='btn btn-light collapsed me-2' 
						data-bs-toggle="collapse" data-bs-target={"#" + this.props.id}><i ref={this.iRef} className="bi-chevron-right"></i></button>
						{this.props.item.name}
					</div>
					<i className='bi-chevron-right'></i>
					<span className="badge bg-primary rounded-pill">{this.props.item.children.length}</span>
				</button>
				
				<div ref={this.divRef} className='list-group collapse' id={this.props.id}>
					{this.props.item.children.map((v,i)=>
					(
						<TreeItem selectionEvent={this.props.selectionEvent} item={v} index={i} id={this.props.id + '-' +i} key={this.props.id + '-' +i}></TreeItem>
					))}
				</div>
			</>
			)
		}
	}
  }

export default TreeItem;