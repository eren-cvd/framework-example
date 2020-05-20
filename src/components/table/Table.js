import { $ } from '@core/dom';

import { ExcelComponent } from '@core/ExcelComponent';
import { TableSelection } from './TableSelection';

import { utils } from './composition/table.utils';
import { create } from './composition/table.template';
import { resize } from './composition/table.resize';

import * as actions from '@store/actions';

export class Table extends ExcelComponent {
    static className = 'excel__table';

    constructor($root, options) {
        const name = 'Table';
        const listeners = ['mousedown', 'keydown', 'input'];

        super($root, {
            name,
            listeners,
            ...options
        });
    }

    onBeforeInit() {
        this.selection = new TableSelection(this.$root);
    }

    init() {
        super.init();

        this.subscribe();
        this.selectCell(this.$root.find('.cell[data-id="0:0"]'));
    }

    subscribe() {
        // Events
        this.$on('formula:input', (data) => {
            this.selection.current.text(data);
        });

        this.$on('formula:done', () => {
            this.selection.current.focus();
        });

        // Store
        // this.$subscribe(state => console.log('Table state', state));
    }

    selectCell($el) {
        this.selection.select($el);

        this.$emit('table:select', $el.text());
    }


    async resizeTable(event) {
        try {
            const data = await resize(this.$root, event);

            this.$dispatch(actions.tableResize(data));
        }
        catch (e) {
            console.warn('Resize error', e.message);
        }
    }

    onMousedown(e) {
        if (utils.shouldResize(e)) {
            this.resizeTable(e);
        }
        else if (utils.isCell(e)) {
            const $target = $(e.target);

            if (e.shiftKey) {
                const ids = utils.matrix($target, this.selection.current);
                const $cells = ids.map(id => this.$root.find(`[data-id="${id}"]`));

                this.selection.selectGroup($cells);
            }
            else {
                this.selection.select($target);
            }
        }
    }

    onKeydown(e) {
        const keys = [
            'Tab',
            'Enter',
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight'
        ];

        const navigate = keys.includes(e.key) && !e.shiftKey;

        if (navigate) {
            e.preventDefault();

            const current = this.selection.current.id(true);
            const newId = utils.nextSelector(e.key, current);

            const $next = this.$root.find(newId);

            this.selectCell($next);
        }
    }

    onInput(e) {
        this.$emit('table:input', $(e.target).text());
    }

    toHtml() {
        const state = this.$store.getState();
        return create(20, state);
    }
}
