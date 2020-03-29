import Service from '@ember/service';
import { A } from '@ember/array';
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { notEmpty } from '@ember/object/computed';

export default class UndoService extends Service {
    @service store;

    @tracked redoStack = A([]);

    @notEmpty('store.transformLog') canUndo;
    @notEmpty('redoStack') canRedo;

    undo() {
        if (!this.canUndo) {
            return;
        }

        const transformId = this.store.transformLog.head;
        const transform = this.store.getTransform(transformId);
        const inverseOperations = this.store.getInverseOperations(transformId);

        this.store.update(inverseOperations).then(() => {
            this.redoStack.pushObject(transform.operations);
        });
    }

    redo() {
        if (!this.canRedo) {
            return;
        }

        const operationsToRedo = this.redoStack.lastObject;
        this.store.update(operationsToRedo).then(() => {
            this.redoStack.popObject();
        });
    }

}
