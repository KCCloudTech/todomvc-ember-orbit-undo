import Service from '@ember/service';
import { A } from '@ember/array';
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { get } from '@ember/object';


export default class UndoService extends Service {
  @service store;

  @tracked redoStack = A([]);
  @tracked undoStack = A([]);
  @tracked isEnabled = false;

  get isDisabled() {
      return !this.isEnabled;
  }

  get canUndo() {
    return this.isEnabled && this.undoStack.length > 0;
  }

  get canRedo() {
    return this.isEnabled && this.redoStack.length > 0;
  }

  constructor() {
    super(...arguments);

    this.store.transformLog.on('append', this.onTransformAppended.bind(this));
  }

  /**
   * Enable future transforms to be recorded for Undo/Redo
   */
  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  /**
   * Clear the Undo/Redo stack history
   */
  reset() {
    this.redoStack = A([]);
    this.undoStack = A([]);
  }

  onTransformAppended(transformIds) {
    if (this.isDisabled) {
      return;
    }

    for (const id of transformIds) {
      const transform = this.store.getTransform(id);
      if (get(transform, 'options.isUndo')) {
        return;
      }

      this.undoStack.pushObject(id);
    }
  }

  undo() {
    if (this.isDisabled || !this.canUndo) {
      return;
    }

    const transformId = this.undoStack.lastObject;
    const transform = this.store.getTransform(transformId);
    const inverseOperations = this.store.getInverseOperations(transformId);

    this.store.update(inverseOperations, { isUndo: true }).then(() => {
      this.undoStack.popObject();
      this.redoStack.pushObject(transform.operations);
    });
  }

  redo() {
    if (this.isDisabled || !this.canRedo) {
      return;
    }

    const operationsToRedo = this.redoStack.lastObject;
    this.store.update(operationsToRedo, { isRedo: true }).then(() => {
      this.redoStack.popObject();
    });
  }

}
