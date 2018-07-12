import { getEmptyImage } from 'react-dnd-html5-backend';
import React from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import cx from 'classnames';

import { componentShape } from '../../util/propShapes';
import { dragConfig, dropConfig } from './dragDroppableConfig';
import {
  DROP_TOP,
  DROP_RIGHT,
  DROP_BOTTOM,
  DROP_LEFT,
} from '../../util/getDropPosition';

const propTypes = {
  children: PropTypes.func,
  className: PropTypes.string,
  component: componentShape.isRequired,
  parentComponent: componentShape,
  depth: PropTypes.number.isRequired,
  disableDragDrop: PropTypes.bool,
  orientation: PropTypes.oneOf(['row', 'column']),
  index: PropTypes.number.isRequired,
  style: PropTypes.object,
  onDrop: PropTypes.func,
  editMode: PropTypes.bool.isRequired,
  useEmptyDragPreview: PropTypes.bool,

  // from react-dnd
  isDragging: PropTypes.bool.isRequired,
  isDraggingOver: PropTypes.bool.isRequired,
  isDraggingOverShallow: PropTypes.bool.isRequired,
  droppableRef: PropTypes.func.isRequired,
  dragSourceRef: PropTypes.func.isRequired,
  dragPreviewRef: PropTypes.func.isRequired,
};

const defaultProps = {
  className: null,
  style: null,
  parentComponent: null,
  disableDragDrop: false,
  children() {},
  onDrop() {},
  orientation: 'row',
  useEmptyDragPreview: false,
};

// export unwrapped component for testing
export class UnwrappedDragDroppable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropIndicator: null, // this gets set/modified by the react-dnd HOCs
    };
    this.setRef = this.setRef.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setRef(ref) {
    this.ref = ref;
    // this is needed for a custom drag preview
    if (this.props.useEmptyDragPreview) {
      this.props.dragPreviewRef(getEmptyImage(), {
        // IE fallback: specify that we'd rather screenshot the node
        // when it already knows it's being dragged so we can hide it with CSS.
        captureDraggingState: true,
      });
    } else {
      this.props.dragPreviewRef(ref);
    }
    this.props.droppableRef(ref);
  }

  render() {
    const {
      children,
      className,
      orientation,
      dragSourceRef,
      isDragging,
      isDraggingOver,
      style,
      editMode,
    } = this.props;

    const { dropIndicator } = this.state;
    const dropIndicatorProps =
      isDraggingOver && dropIndicator
        ? {
            className: cx(
              'drop-indicator',
              dropIndicator === DROP_TOP && 'drop-indicator--top',
              dropIndicator === DROP_BOTTOM && 'drop-indicator--bottom',
              dropIndicator === DROP_LEFT && 'drop-indicator--left',
              dropIndicator === DROP_RIGHT && 'drop-indicator--right',
            ),
          }
        : null;

    const childProps = editMode
      ? {
          dragSourceRef,
          dropIndicatorProps,
        }
      : {};

    return (
      <div
        style={style}
        ref={this.setRef}
        className={cx(
          'dragdroppable',
          orientation === 'row' && 'dragdroppable-row',
          orientation === 'column' && 'dragdroppable-column',
          isDragging && 'dragdroppable--dragging',
          className,
        )}
      >
        {children(childProps)}
      </div>
    );
  }
}

UnwrappedDragDroppable.propTypes = propTypes;
UnwrappedDragDroppable.defaultProps = defaultProps;

// note that the composition order here determines using
// component.method() vs decoratedComponentInstance.method() in the drag/drop config
export default DropTarget(...dropConfig)(
  DragSource(...dragConfig)(UnwrappedDragDroppable),
);