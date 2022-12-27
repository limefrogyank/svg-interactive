import {Component} from 'react'
import TreeItem from './TreeItem';
import './Tree.css';
import { ITreeItemData } from './ITreeItemData';

interface ITreeProps{
	children: any[];
	selectionEvent: (ev: React.MouseEvent<HTMLButtonElement,MouseEvent>, data: ITreeItemData|null)=>void;
}

class Tree extends Component<ITreeProps> {

	render() {
		if (this.props.children === undefined || this.props.children.length === 0){
			return (
			<>
				<div></div>
			</>
			)
		} else {
			return (
			<>
				<div className='list-group list-group-root' id='treeRoot'>
					{this.props.children.map((v,i)=>(
						<TreeItem selectionEvent={this.props.selectionEvent} item={v} index={i} id={'item-' + i} key={'item-' + i}></TreeItem>
					))}
				</div>
			</>
			)
		}
	}
  }

export default Tree;