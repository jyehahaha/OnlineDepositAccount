
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\forms\Input.svelte generated by Svelte v3.31.2 */

    const file = "src\\components\\forms\\Input.svelte";

    // (24:4) {:else}
    function create_else_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", /*id*/ ctx[6]);
    			attr_dev(input, "name", /*name*/ ctx[5]);
    			input.disabled = /*disabled*/ ctx[4];
    			attr_dev(input, "class", "form-control");
    			add_location(input, file, 24, 8, 615);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*output*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*disabled*/ 16) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*output*/ 1 && input.value !== /*output*/ ctx[0]) {
    				set_input_value(input, /*output*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(24:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#if pattern != ""}
    function create_if_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", /*id*/ ctx[6]);
    			attr_dev(input, "name", /*name*/ ctx[5]);
    			attr_dev(input, "pattern", /*pattern*/ ctx[2]);
    			attr_dev(input, "title", /*title*/ ctx[3]);
    			input.disabled = /*disabled*/ ctx[4];
    			attr_dev(input, "class", "form-control");
    			add_location(input, file, 13, 8, 376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*output*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pattern*/ 4) {
    				attr_dev(input, "pattern", /*pattern*/ ctx[2]);
    			}

    			if (dirty & /*title*/ 8) {
    				attr_dev(input, "title", /*title*/ ctx[3]);
    			}

    			if (dirty & /*disabled*/ 16) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*output*/ 1 && input.value !== /*output*/ ctx[0]) {
    				set_input_value(input, /*output*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(13:4) {#if pattern != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let label_1;
    	let t0;
    	let t1;
    	let t2;

    	function select_block_type(ctx, dirty) {
    		if (/*pattern*/ ctx[2] != "") return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = text(":");
    			t2 = space();
    			if_block.c();
    			attr_dev(label_1, "for", /*id*/ ctx[6]);
    			add_location(label_1, file, 11, 4, 309);
    			attr_dev(div, "class", "input_group form-group svelte-9kee07");
    			add_location(div, file, 10, 0, 267);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label_1);
    			append_dev(label_1, t0);
    			append_dev(label_1, t1);
    			append_dev(div, t2);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, []);
    	let { label = "Label" } = $$props;
    	let { pattern = "" } = $$props;
    	let { title = "" } = $$props;
    	let { output = "" } = $$props;
    	let { disabled = false } = $$props;
    	let name = label.toLocaleLowerCase().replace(/ /g, "_");
    	let id = name + "_id";
    	const writable_props = ["label", "pattern", "title", "output", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		output = this.value;
    		$$invalidate(0, output);
    	}

    	function input_input_handler_1() {
    		output = this.value;
    		$$invalidate(0, output);
    	}

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("pattern" in $$props) $$invalidate(2, pattern = $$props.pattern);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		label,
    		pattern,
    		title,
    		output,
    		disabled,
    		name,
    		id
    	});

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("pattern" in $$props) $$invalidate(2, pattern = $$props.pattern);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("name" in $$props) $$invalidate(5, name = $$props.name);
    		if ("id" in $$props) $$invalidate(6, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		output,
    		label,
    		pattern,
    		title,
    		disabled,
    		name,
    		id,
    		input_input_handler,
    		input_input_handler_1
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			label: 1,
    			pattern: 2,
    			title: 3,
    			output: 0,
    			disabled: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get label() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pattern() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pattern(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get output() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set output(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\forms\CheckBox.svelte generated by Svelte v3.31.2 */

    const file$1 = "src\\components\\forms\\CheckBox.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (13:4) {#each values as value}
    function create_each_block(ctx) {
    	let label_1;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*value*/ ctx[5].label + "";
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = /*value*/ ctx[5].label.toLocaleLowerCase();
    			input.value = input.__value;
    			attr_dev(input, "class", "form-control");
    			/*$$binding_groups*/ ctx[4][0].push(input);
    			add_location(input, file$1, 14, 12, 283);
    			add_location(label_1, file$1, 13, 8, 262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, input);
    			input.checked = ~/*output*/ ctx[0].indexOf(input.__value);
    			append_dev(label_1, t0);
    			append_dev(label_1, t1);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values*/ 4 && input_value_value !== (input_value_value = /*value*/ ctx[5].label.toLocaleLowerCase())) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*output*/ 1) {
    				input.checked = ~/*output*/ ctx[0].indexOf(input.__value);
    			}

    			if (dirty & /*values*/ 4 && t1_value !== (t1_value = /*value*/ ctx[5].label + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			/*$$binding_groups*/ ctx[4][0].splice(/*$$binding_groups*/ ctx[4][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(13:4) {#each values as value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let br;
    	let each_value = /*values*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = text(":\r\n    ");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			br = element("br");
    			add_location(br, file$1, 23, 4, 534);
    			attr_dev(div, "class", "checkbox_group form-group svelte-1iuxpus");
    			add_location(div, file$1, 10, 0, 170);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    			append_dev(div, br);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*values, output*/ 5) {
    				each_value = /*values*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CheckBox", slots, []);
    	let { label = "Label" } = $$props;
    	let { values = [{ label: "yes" }] } = $$props;
    	let { output = [] } = $$props;
    	const writable_props = ["label", "values", "output"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CheckBox> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		output = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, output);
    	}

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("values" in $$props) $$invalidate(2, values = $$props.values);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    	};

    	$$self.$capture_state = () => ({ label, values, output });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("values" in $$props) $$invalidate(2, values = $$props.values);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [output, label, values, input_change_handler, $$binding_groups];
    }

    class CheckBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { label: 1, values: 2, output: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckBox",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get label() {
    		throw new Error("<CheckBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<CheckBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get values() {
    		throw new Error("<CheckBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set values(value) {
    		throw new Error("<CheckBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get output() {
    		throw new Error("<CheckBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set output(value) {
    		throw new Error("<CheckBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\forms\Radio.svelte generated by Svelte v3.31.2 */

    const file$2 = "src\\components\\forms\\Radio.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (16:4) {#each values as value}
    function create_each_block$1(ctx) {
    	let label_1;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*value*/ ctx[5].label + "";
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(input, "type", "radio");
    			input.__value = input_value_value = /*value*/ ctx[5].label.toLocaleLowerCase();
    			input.value = input.__value;
    			attr_dev(input, "class", "form-check-input");
    			/*$$binding_groups*/ ctx[4][0].push(input);
    			add_location(input, file$2, 17, 12, 354);
    			attr_dev(label_1, "class", "form-check-label");
    			add_location(label_1, file$2, 16, 8, 308);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, input);
    			input.checked = input.__value === /*output*/ ctx[0];
    			append_dev(label_1, t0);
    			append_dev(label_1, t1);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values*/ 4 && input_value_value !== (input_value_value = /*value*/ ctx[5].label.toLocaleLowerCase())) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*output*/ 1) {
    				input.checked = input.__value === /*output*/ ctx[0];
    			}

    			if (dirty & /*values*/ 4 && t1_value !== (t1_value = /*value*/ ctx[5].label + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			/*$$binding_groups*/ ctx[4][0].splice(/*$$binding_groups*/ ctx[4][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(16:4) {#each values as value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let br;
    	let each_value = /*values*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = text(":\r\n    ");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			br = element("br");
    			add_location(br, file$2, 26, 4, 606);
    			attr_dev(div, "class", "radio_group form-check svelte-1ltjnm6");
    			add_location(div, file$2, 13, 0, 219);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    			append_dev(div, br);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*values, output*/ 5) {
    				each_value = /*values*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Radio", slots, []);
    	let { label = "Label" } = $$props;
    	let { values = [{ label: "Yes" }, { label: "No" }] } = $$props;
    	let { output = "" } = $$props;
    	const writable_props = ["label", "values", "output"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Radio> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		output = this.__value;
    		$$invalidate(0, output);
    	}

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("values" in $$props) $$invalidate(2, values = $$props.values);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    	};

    	$$self.$capture_state = () => ({ label, values, output });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("values" in $$props) $$invalidate(2, values = $$props.values);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [output, label, values, input_change_handler, $$binding_groups];
    }

    class Radio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { label: 1, values: 2, output: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Radio",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get label() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get values() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set values(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get output() {
    		throw new Error("<Radio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set output(value) {
    		throw new Error("<Radio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\forms\Select.svelte generated by Svelte v3.31.2 */

    const file$3 = "src\\components\\forms\\Select.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (15:8) {#each values as value}
    function create_each_block$2(ctx) {
    	let option;
    	let t0_value = /*value*/ ctx[7].label + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*value*/ ctx[7].label.toLocaleLowerCase();
    			option.value = option.__value;
    			add_location(option, file$3, 15, 12, 443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values*/ 8 && t0_value !== (t0_value = /*value*/ ctx[7].label + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*values*/ 8 && option_value_value !== (option_value_value = /*value*/ ctx[7].label.toLocaleLowerCase())) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(15:8) {#each values as value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let label_1;
    	let t0;
    	let t1;
    	let t2;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*values*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = text(":");
    			t2 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(label_1, "for", /*id*/ ctx[5]);
    			add_location(label_1, file$3, 11, 4, 284);
    			attr_dev(select, "name", /*name*/ ctx[4]);
    			attr_dev(select, "id", /*id*/ ctx[5]);
    			select.disabled = /*disabled*/ ctx[2];
    			attr_dev(select, "class", "form-control");
    			if (/*output*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[6].call(select));
    			add_location(select, file$3, 13, 4, 324);
    			attr_dev(div, "class", "select_group form-group  svelte-14o0z39");
    			add_location(div, file$3, 10, 0, 240);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label_1);
    			append_dev(label_1, t0);
    			append_dev(label_1, t1);
    			append_dev(div, t2);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*output*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*values*/ 8) {
    				each_value = /*values*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*disabled*/ 4) {
    				prop_dev(select, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*output, values*/ 9) {
    				select_option(select, /*output*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, []);
    	let { label = "Label" } = $$props;
    	let { output = "" } = $$props;
    	let { disabled = false } = $$props;
    	let name = label.toLocaleLowerCase().replace(/ /g, "_");
    	let id = name + "_id";
    	let { values = [] } = $$props;
    	const writable_props = ["label", "output", "disabled", "values"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		output = select_value(this);
    		$$invalidate(0, output);
    		$$invalidate(3, values);
    	}

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("values" in $$props) $$invalidate(3, values = $$props.values);
    	};

    	$$self.$capture_state = () => ({
    		label,
    		output,
    		disabled,
    		name,
    		id,
    		values
    	});

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("id" in $$props) $$invalidate(5, id = $$props.id);
    		if ("values" in $$props) $$invalidate(3, values = $$props.values);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [output, label, disabled, values, name, id, select_change_handler];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			label: 1,
    			output: 0,
    			disabled: 2,
    			values: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get label() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get output() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set output(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get values() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set values(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\forms\Number.svelte generated by Svelte v3.31.2 */

    const file$4 = "src\\components\\forms\\Number.svelte";

    // (24:4) {:else}
    function create_else_block$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "tel");
    			attr_dev(input, "id", /*id*/ ctx[6]);
    			attr_dev(input, "name", /*name*/ ctx[5]);
    			input.disabled = /*disabled*/ ctx[4];
    			attr_dev(input, "class", "form-control");
    			add_location(input, file$4, 24, 8, 614);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*output*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*disabled*/ 16) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*output*/ 1) {
    				set_input_value(input, /*output*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(24:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#if pattern != ""}
    function create_if_block$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "tel");
    			attr_dev(input, "id", /*id*/ ctx[6]);
    			attr_dev(input, "name", /*name*/ ctx[5]);
    			attr_dev(input, "pattern", /*pattern*/ ctx[2]);
    			attr_dev(input, "title", /*title*/ ctx[3]);
    			input.disabled = /*disabled*/ ctx[4];
    			attr_dev(input, "class", "form-control");
    			add_location(input, file$4, 13, 8, 376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*output*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pattern*/ 4) {
    				attr_dev(input, "pattern", /*pattern*/ ctx[2]);
    			}

    			if (dirty & /*title*/ 8) {
    				attr_dev(input, "title", /*title*/ ctx[3]);
    			}

    			if (dirty & /*disabled*/ 16) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*output*/ 1) {
    				set_input_value(input, /*output*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(13:4) {#if pattern != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let label_1;
    	let t0;
    	let t1;
    	let t2;

    	function select_block_type(ctx, dirty) {
    		if (/*pattern*/ ctx[2] != "") return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = text(":");
    			t2 = space();
    			if_block.c();
    			attr_dev(label_1, "for", /*id*/ ctx[6]);
    			add_location(label_1, file$4, 11, 4, 309);
    			attr_dev(div, "class", "input_group form-group svelte-9kee07");
    			add_location(div, file$4, 10, 0, 267);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label_1);
    			append_dev(label_1, t0);
    			append_dev(label_1, t1);
    			append_dev(div, t2);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Number", slots, []);
    	let { label = "Label" } = $$props;
    	let { pattern = "" } = $$props;
    	let { title = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { output = "" } = $$props;
    	let name = label.toLocaleLowerCase().replace(/ /g, "_");
    	let id = name + "_id";
    	const writable_props = ["label", "pattern", "title", "disabled", "output"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Number> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		output = this.value;
    		$$invalidate(0, output);
    	}

    	function input_input_handler_1() {
    		output = this.value;
    		$$invalidate(0, output);
    	}

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("pattern" in $$props) $$invalidate(2, pattern = $$props.pattern);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    	};

    	$$self.$capture_state = () => ({
    		label,
    		pattern,
    		title,
    		disabled,
    		output,
    		name,
    		id
    	});

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("pattern" in $$props) $$invalidate(2, pattern = $$props.pattern);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    		if ("name" in $$props) $$invalidate(5, name = $$props.name);
    		if ("id" in $$props) $$invalidate(6, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		output,
    		label,
    		pattern,
    		title,
    		disabled,
    		name,
    		id,
    		input_input_handler,
    		input_input_handler_1
    	];
    }

    class Number extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			label: 1,
    			pattern: 2,
    			title: 3,
    			disabled: 4,
    			output: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Number",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get label() {
    		throw new Error("<Number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pattern() {
    		throw new Error("<Number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pattern(value) {
    		throw new Error("<Number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get output() {
    		throw new Error("<Number>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set output(value) {
    		throw new Error("<Number>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\forms\Date.svelte generated by Svelte v3.31.2 */

    const file$5 = "src\\components\\forms\\Date.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let label_1;
    	let t0;
    	let t1;
    	let t2;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = text(":");
    			t2 = space();
    			input = element("input");
    			attr_dev(label_1, "for", /*id*/ ctx[4]);
    			add_location(label_1, file$5, 9, 4, 250);
    			attr_dev(input, "type", "date");
    			attr_dev(input, "id", /*id*/ ctx[4]);
    			attr_dev(input, "name", /*name*/ ctx[3]);
    			input.disabled = /*disabled*/ ctx[2];
    			attr_dev(input, "class", "form-control");
    			add_location(input, file$5, 10, 4, 288);
    			attr_dev(div, "class", "date_group form-group svelte-wnh515");
    			add_location(div, file$5, 8, 0, 209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label_1);
    			append_dev(label_1, t0);
    			append_dev(label_1, t1);
    			append_dev(div, t2);
    			append_dev(div, input);
    			set_input_value(input, /*output*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*disabled*/ 4) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*output*/ 1) {
    				set_input_value(input, /*output*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Date", slots, []);
    	let { label = "Label" } = $$props;
    	let { output = "" } = $$props;
    	let { disabled = false } = $$props;
    	let name = label.toLocaleLowerCase().replace(/ /g, "_");
    	let id = name + "_id";
    	const writable_props = ["label", "output", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Date> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		output = this.value;
    		$$invalidate(0, output);
    	}

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ label, output, disabled, name, id });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [output, label, disabled, name, id, input_input_handler];
    }

    class Date extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { label: 1, output: 0, disabled: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Date",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get label() {
    		throw new Error("<Date>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Date>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get output() {
    		throw new Error("<Date>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set output(value) {
    		throw new Error("<Date>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Date>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Date>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file$6 = "src\\App.svelte";

    // (2768:24) 
    function create_if_block_62(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Confirm Page";
    			add_location(h2, file$6, 2768, 5, 49624);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_62.name,
    		type: "if",
    		source: "(2768:24) ",
    		ctx
    	});

    	return block;
    }

    // (2738:24) 
    function create_if_block_57(ctx) {
    	let h2;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let if_block3_anchor;
    	let current;
    	let if_block0 = /*form_display*/ ctx[1].bmmb_account_type.display && create_if_block_61(ctx);
    	let if_block1 = /*form_display*/ ctx[1].purpose_of_account.display && create_if_block_60(ctx);
    	let if_block2 = /*form_display*/ ctx[1].product_to_open.display && create_if_block_59(ctx);
    	let if_block3 = /*form_display*/ ctx[1].prefered_branch.display && create_if_block_58(ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Account Selections";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			add_location(h2, file$6, 2738, 5, 48695);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*form_display*/ ctx[1].bmmb_account_type.display) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_61(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].purpose_of_account.display) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_60(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].product_to_open.display) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_59(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t4.parentNode, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].prefered_branch.display) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_58(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_57.name,
    		type: "if",
    		source: "(2738:24) ",
    		ctx
    	});

    	return block;
    }

    // (2715:24) 
    function create_if_block_53(ctx) {
    	let h2;
    	let t1;
    	let t2;
    	let t3;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*form_display*/ ctx[1].contact_person_name.display && create_if_block_56(ctx);
    	let if_block1 = /*form_display*/ ctx[1].contact_relationship.display && create_if_block_55(ctx);
    	let if_block2 = /*form_display*/ ctx[1].contact_mobile_number.display && create_if_block_54(ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Energcency Contact Person Details";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			add_location(h2, file$6, 2715, 5, 47978);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*form_display*/ ctx[1].contact_person_name.display) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_56(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].contact_relationship.display) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_55(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].contact_mobile_number.display) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_54(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_53.name,
    		type: "if",
    		source: "(2715:24) ",
    		ctx
    	});

    	return block;
    }

    // (2658:24) 
    function create_if_block_45(ctx) {
    	let h2;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let if_block6_anchor;
    	let current;
    	let if_block0 = /*form_display*/ ctx[1].mobile_number.display && create_if_block_52(ctx);
    	let if_block1 = /*form_display*/ ctx[1].office_number.display && create_if_block_51(ctx);
    	let if_block2 = /*form_display*/ ctx[1].email_address.display && create_if_block_50(ctx);
    	let if_block3 = /*form_display*/ ctx[1].race.display && create_if_block_49(ctx);
    	let if_block4 = /*form_display*/ ctx[1].gender.display && create_if_block_48(ctx);
    	let if_block5 = /*form_display*/ ctx[1].maritial_status.display && create_if_block_47(ctx);
    	let if_block6 = /*form_display*/ ctx[1].no_of_dependents.display && create_if_block_46(ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Additional Infomations";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			if (if_block5) if_block5.c();
    			t7 = space();
    			if (if_block6) if_block6.c();
    			if_block6_anchor = empty();
    			add_location(h2, file$6, 2658, 5, 46511);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, if_block6_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*form_display*/ ctx[1].mobile_number.display) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_52(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].office_number.display) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_51(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].email_address.display) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_50(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t4.parentNode, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].race.display) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_49(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].gender.display) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_48(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(t6.parentNode, t6);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].maritial_status.display) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_47(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(t7.parentNode, t7);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].no_of_dependents.display) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_46(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(if_block6_anchor.parentNode, if_block6_anchor);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(if_block6_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_45.name,
    		type: "if",
    		source: "(2658:24) ",
    		ctx
    	});

    	return block;
    }

    // (2534:24) 
    function create_if_block_26(ctx) {
    	let h2;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let select;
    	let updating_output;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let t19;
    	let if_block17_anchor;
    	let current;
    	let if_block0 = /*form_display*/ ctx[1].bmmb_high_net_worth.display && create_if_block_44(ctx);
    	let if_block1 = /*form_display*/ ctx[1].pep_related.display && create_if_block_43(ctx);
    	let if_block2 = /*form_display*/ ctx[1].local_address.display && create_if_block_42(ctx);
    	let if_block3 = /*form_display*/ ctx[1].local_postal_code.display && create_if_block_41(ctx);
    	let if_block4 = /*form_display*/ ctx[1].local_city.display && create_if_block_40(ctx);
    	let if_block5 = /*form_display*/ ctx[1].local_state_code.display && create_if_block_39(ctx);
    	let if_block6 = /*form_display*/ ctx[1].local_coutry.display && create_if_block_38(ctx);
    	let if_block7 = /*form_display*/ ctx[1].foreign_address.display && create_if_block_37(ctx);
    	let if_block8 = /*form_display*/ ctx[1].foreign_postal_code.display && create_if_block_36(ctx);
    	let if_block9 = /*form_display*/ ctx[1].foreign_city.display && create_if_block_35(ctx);
    	let if_block10 = /*form_display*/ ctx[1].foreign_state_code.display && create_if_block_34(ctx);
    	let if_block11 = /*form_display*/ ctx[1].foreign_coutry.display && create_if_block_33(ctx);

    	function select_output_binding_12(value) {
    		/*select_output_binding_12*/ ctx[63].call(null, value);
    	}

    	let select_props = {
    		label: "Mailing Address the same as Local Address",
    		values: /*pep_related_options*/ ctx[16]
    	};

    	if (/*output*/ ctx[0].mail_same_local !== void 0) {
    		select_props.output = /*output*/ ctx[0].mail_same_local;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_12));
    	let if_block12 = /*form_display*/ ctx[1].mailing_address.display && create_if_block_32(ctx);
    	let if_block13 = /*form_display*/ ctx[1].mailing_postal_code.display && create_if_block_31(ctx);
    	let if_block14 = /*form_display*/ ctx[1].mailing_city.display && create_if_block_30(ctx);
    	let if_block15 = /*form_display*/ ctx[1].mailing_state_code.display && create_if_block_29(ctx);
    	let if_block16 = /*form_display*/ ctx[1].mailing_coutry.display && create_if_block_28(ctx);
    	let if_block17 = /*form_display*/ ctx[1].property_ownership.display && create_if_block_27(ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Address Details";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			if (if_block5) if_block5.c();
    			t7 = space();
    			if (if_block6) if_block6.c();
    			t8 = space();
    			if (if_block7) if_block7.c();
    			t9 = space();
    			if (if_block8) if_block8.c();
    			t10 = space();
    			if (if_block9) if_block9.c();
    			t11 = space();
    			if (if_block10) if_block10.c();
    			t12 = space();
    			if (if_block11) if_block11.c();
    			t13 = space();
    			create_component(select.$$.fragment);
    			t14 = space();
    			if (if_block12) if_block12.c();
    			t15 = space();
    			if (if_block13) if_block13.c();
    			t16 = space();
    			if (if_block14) if_block14.c();
    			t17 = space();
    			if (if_block15) if_block15.c();
    			t18 = space();
    			if (if_block16) if_block16.c();
    			t19 = space();
    			if (if_block17) if_block17.c();
    			if_block17_anchor = empty();
    			add_location(h2, file$6, 2534, 5, 43294);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if (if_block10) if_block10.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			if (if_block11) if_block11.m(target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(select, target, anchor);
    			insert_dev(target, t14, anchor);
    			if (if_block12) if_block12.m(target, anchor);
    			insert_dev(target, t15, anchor);
    			if (if_block13) if_block13.m(target, anchor);
    			insert_dev(target, t16, anchor);
    			if (if_block14) if_block14.m(target, anchor);
    			insert_dev(target, t17, anchor);
    			if (if_block15) if_block15.m(target, anchor);
    			insert_dev(target, t18, anchor);
    			if (if_block16) if_block16.m(target, anchor);
    			insert_dev(target, t19, anchor);
    			if (if_block17) if_block17.m(target, anchor);
    			insert_dev(target, if_block17_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*form_display*/ ctx[1].bmmb_high_net_worth.display) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_44(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].pep_related.display) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_43(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].local_address.display) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_42(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t4.parentNode, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].local_postal_code.display) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_41(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].local_city.display) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_40(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(t6.parentNode, t6);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].local_state_code.display) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_39(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(t7.parentNode, t7);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].local_coutry.display) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_38(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(t8.parentNode, t8);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].foreign_address.display) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block_37(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(t9.parentNode, t9);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].foreign_postal_code.display) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block8, 1);
    					}
    				} else {
    					if_block8 = create_if_block_36(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(t10.parentNode, t10);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].foreign_city.display) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block9, 1);
    					}
    				} else {
    					if_block9 = create_if_block_35(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(t11.parentNode, t11);
    				}
    			} else if (if_block9) {
    				group_outros();

    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].foreign_state_code.display) {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block10, 1);
    					}
    				} else {
    					if_block10 = create_if_block_34(ctx);
    					if_block10.c();
    					transition_in(if_block10, 1);
    					if_block10.m(t12.parentNode, t12);
    				}
    			} else if (if_block10) {
    				group_outros();

    				transition_out(if_block10, 1, 1, () => {
    					if_block10 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].foreign_coutry.display) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block11, 1);
    					}
    				} else {
    					if_block11 = create_if_block_33(ctx);
    					if_block11.c();
    					transition_in(if_block11, 1);
    					if_block11.m(t13.parentNode, t13);
    				}
    			} else if (if_block11) {
    				group_outros();

    				transition_out(if_block11, 1, 1, () => {
    					if_block11 = null;
    				});

    				check_outros();
    			}

    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].mail_same_local;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);

    			if (/*form_display*/ ctx[1].mailing_address.display) {
    				if (if_block12) {
    					if_block12.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block12, 1);
    					}
    				} else {
    					if_block12 = create_if_block_32(ctx);
    					if_block12.c();
    					transition_in(if_block12, 1);
    					if_block12.m(t15.parentNode, t15);
    				}
    			} else if (if_block12) {
    				group_outros();

    				transition_out(if_block12, 1, 1, () => {
    					if_block12 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].mailing_postal_code.display) {
    				if (if_block13) {
    					if_block13.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block13, 1);
    					}
    				} else {
    					if_block13 = create_if_block_31(ctx);
    					if_block13.c();
    					transition_in(if_block13, 1);
    					if_block13.m(t16.parentNode, t16);
    				}
    			} else if (if_block13) {
    				group_outros();

    				transition_out(if_block13, 1, 1, () => {
    					if_block13 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].mailing_city.display) {
    				if (if_block14) {
    					if_block14.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block14, 1);
    					}
    				} else {
    					if_block14 = create_if_block_30(ctx);
    					if_block14.c();
    					transition_in(if_block14, 1);
    					if_block14.m(t17.parentNode, t17);
    				}
    			} else if (if_block14) {
    				group_outros();

    				transition_out(if_block14, 1, 1, () => {
    					if_block14 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].mailing_state_code.display) {
    				if (if_block15) {
    					if_block15.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block15, 1);
    					}
    				} else {
    					if_block15 = create_if_block_29(ctx);
    					if_block15.c();
    					transition_in(if_block15, 1);
    					if_block15.m(t18.parentNode, t18);
    				}
    			} else if (if_block15) {
    				group_outros();

    				transition_out(if_block15, 1, 1, () => {
    					if_block15 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].mailing_coutry.display) {
    				if (if_block16) {
    					if_block16.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block16, 1);
    					}
    				} else {
    					if_block16 = create_if_block_28(ctx);
    					if_block16.c();
    					transition_in(if_block16, 1);
    					if_block16.m(t19.parentNode, t19);
    				}
    			} else if (if_block16) {
    				group_outros();

    				transition_out(if_block16, 1, 1, () => {
    					if_block16 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].property_ownership.display) {
    				if (if_block17) {
    					if_block17.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block17, 1);
    					}
    				} else {
    					if_block17 = create_if_block_27(ctx);
    					if_block17.c();
    					transition_in(if_block17, 1);
    					if_block17.m(if_block17_anchor.parentNode, if_block17_anchor);
    				}
    			} else if (if_block17) {
    				group_outros();

    				transition_out(if_block17, 1, 1, () => {
    					if_block17 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);
    			transition_in(if_block9);
    			transition_in(if_block10);
    			transition_in(if_block11);
    			transition_in(select.$$.fragment, local);
    			transition_in(if_block12);
    			transition_in(if_block13);
    			transition_in(if_block14);
    			transition_in(if_block15);
    			transition_in(if_block16);
    			transition_in(if_block17);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			transition_out(if_block9);
    			transition_out(if_block10);
    			transition_out(if_block11);
    			transition_out(select.$$.fragment, local);
    			transition_out(if_block12);
    			transition_out(if_block13);
    			transition_out(if_block14);
    			transition_out(if_block15);
    			transition_out(if_block16);
    			transition_out(if_block17);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (if_block10) if_block10.d(detaching);
    			if (detaching) detach_dev(t12);
    			if (if_block11) if_block11.d(detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(select, detaching);
    			if (detaching) detach_dev(t14);
    			if (if_block12) if_block12.d(detaching);
    			if (detaching) detach_dev(t15);
    			if (if_block13) if_block13.d(detaching);
    			if (detaching) detach_dev(t16);
    			if (if_block14) if_block14.d(detaching);
    			if (detaching) detach_dev(t17);
    			if (if_block15) if_block15.d(detaching);
    			if (detaching) detach_dev(t18);
    			if (if_block16) if_block16.d(detaching);
    			if (detaching) detach_dev(t19);
    			if (if_block17) if_block17.d(detaching);
    			if (detaching) detach_dev(if_block17_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_26.name,
    		type: "if",
    		source: "(2534:24) ",
    		ctx
    	});

    	return block;
    }

    // (2445:24) 
    function create_if_block_13(ctx) {
    	let h2;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let if_block11_anchor;
    	let current;
    	let if_block0 = /*form_display*/ ctx[1].educations_detail.display && create_if_block_25(ctx);
    	let if_block1 = /*form_display*/ ctx[1].occupation.display && create_if_block_24(ctx);
    	let if_block2 = /*form_display*/ ctx[1].job_title.display && create_if_block_23(ctx);
    	let if_block3 = /*form_display*/ ctx[1].bmmb_staff.display && create_if_block_22(ctx);
    	let if_block4 = /*form_display*/ ctx[1].bmmb_staff_id.display && create_if_block_21(ctx);
    	let if_block5 = /*form_display*/ ctx[1].employment_type.display && create_if_block_20(ctx);
    	let if_block6 = /*form_display*/ ctx[1].employment_sector.display && create_if_block_19(ctx);
    	let if_block7 = /*form_display*/ ctx[1].monthly_basic_salary.display && create_if_block_18(ctx);
    	let if_block8 = /*form_display*/ ctx[1].monthly_other_salary.display && create_if_block_17(ctx);
    	let if_block9 = /*form_display*/ ctx[1].employer_name.display && create_if_block_16(ctx);
    	let if_block10 = /*form_display*/ ctx[1].nature_of_business.display && create_if_block_15(ctx);
    	let if_block11 = /*form_display*/ ctx[1].no_of_other_banks_used.display && create_if_block_14(ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Employment Details";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			if (if_block5) if_block5.c();
    			t7 = space();
    			if (if_block6) if_block6.c();
    			t8 = space();
    			if (if_block7) if_block7.c();
    			t9 = space();
    			if (if_block8) if_block8.c();
    			t10 = space();
    			if (if_block9) if_block9.c();
    			t11 = space();
    			if (if_block10) if_block10.c();
    			t12 = space();
    			if (if_block11) if_block11.c();
    			if_block11_anchor = empty();
    			add_location(h2, file$6, 2445, 5, 40716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if (if_block10) if_block10.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			if (if_block11) if_block11.m(target, anchor);
    			insert_dev(target, if_block11_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*form_display*/ ctx[1].educations_detail.display) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_25(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].occupation.display) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_24(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].job_title.display) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_23(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t4.parentNode, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].bmmb_staff.display) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_22(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].bmmb_staff_id.display) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_21(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(t6.parentNode, t6);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].employment_type.display) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_20(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(t7.parentNode, t7);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].employment_sector.display) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_19(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(t8.parentNode, t8);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].monthly_basic_salary.display) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block_18(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(t9.parentNode, t9);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].monthly_other_salary.display) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block8, 1);
    					}
    				} else {
    					if_block8 = create_if_block_17(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(t10.parentNode, t10);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].employer_name.display) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block9, 1);
    					}
    				} else {
    					if_block9 = create_if_block_16(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(t11.parentNode, t11);
    				}
    			} else if (if_block9) {
    				group_outros();

    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].nature_of_business.display) {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block10, 1);
    					}
    				} else {
    					if_block10 = create_if_block_15(ctx);
    					if_block10.c();
    					transition_in(if_block10, 1);
    					if_block10.m(t12.parentNode, t12);
    				}
    			} else if (if_block10) {
    				group_outros();

    				transition_out(if_block10, 1, 1, () => {
    					if_block10 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].no_of_other_banks_used.display) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block11, 1);
    					}
    				} else {
    					if_block11 = create_if_block_14(ctx);
    					if_block11.c();
    					transition_in(if_block11, 1);
    					if_block11.m(if_block11_anchor.parentNode, if_block11_anchor);
    				}
    			} else if (if_block11) {
    				group_outros();

    				transition_out(if_block11, 1, 1, () => {
    					if_block11 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);
    			transition_in(if_block9);
    			transition_in(if_block10);
    			transition_in(if_block11);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			transition_out(if_block9);
    			transition_out(if_block10);
    			transition_out(if_block11);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (if_block10) if_block10.d(detaching);
    			if (detaching) detach_dev(t12);
    			if (if_block11) if_block11.d(detaching);
    			if (detaching) detach_dev(if_block11_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(2445:24) ",
    		ctx
    	});

    	return block;
    }

    // (2373:4) {#if step == 1}
    function create_if_block_2(ctx) {
    	let h2;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let if_block9_anchor;
    	let current;
    	let if_block0 = /*form_display*/ ctx[1].us_related.display && create_if_block_12(ctx);
    	let if_block1 = /*form_display*/ ctx[1].full_name.display && create_if_block_11(ctx);
    	let if_block2 = /*form_display*/ ctx[1].type_of_id.display && create_if_block_10(ctx);
    	let if_block3 = /*form_display*/ ctx[1].id_number.display && create_if_block_9(ctx);
    	let if_block4 = /*form_display*/ ctx[1].passport_number.display && create_if_block_8(ctx);
    	let if_block5 = /*form_display*/ ctx[1].nationality.display && create_if_block_7(ctx);
    	let if_block6 = /*form_display*/ ctx[1].pr_status.display && create_if_block_6(ctx);
    	let if_block7 = /*form_display*/ ctx[1].pr_id_number.display && create_if_block_5(ctx);
    	let if_block8 = /*form_display*/ ctx[1].pr_country.display && create_if_block_4(ctx);
    	let if_block9 = /*form_display*/ ctx[1].date_of_birth.display && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Basic Infomations";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			if (if_block5) if_block5.c();
    			t7 = space();
    			if (if_block6) if_block6.c();
    			t8 = space();
    			if (if_block7) if_block7.c();
    			t9 = space();
    			if (if_block8) if_block8.c();
    			t10 = space();
    			if (if_block9) if_block9.c();
    			if_block9_anchor = empty();
    			add_location(h2, file$6, 2373, 5, 38782);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, if_block9_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*form_display*/ ctx[1].us_related.display) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_12(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].full_name.display) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_11(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].type_of_id.display) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_10(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t4.parentNode, t4);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].id_number.display) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_9(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t5.parentNode, t5);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].passport_number.display) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_8(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(t6.parentNode, t6);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].nationality.display) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_7(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(t7.parentNode, t7);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].pr_status.display) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_6(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(t8.parentNode, t8);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].pr_id_number.display) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block_5(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(t9.parentNode, t9);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].pr_country.display) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block8, 1);
    					}
    				} else {
    					if_block8 = create_if_block_4(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(t10.parentNode, t10);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (/*form_display*/ ctx[1].date_of_birth.display) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);

    					if (dirty[0] & /*form_display*/ 2) {
    						transition_in(if_block9, 1);
    					}
    				} else {
    					if_block9 = create_if_block_3(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(if_block9_anchor.parentNode, if_block9_anchor);
    				}
    			} else if (if_block9) {
    				group_outros();

    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);
    			transition_in(if_block9);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			transition_out(if_block9);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(if_block9_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(2373:4) {#if step == 1}",
    		ctx
    	});

    	return block;
    }

    // (2740:5) {#if form_display.bmmb_account_type.display}
    function create_if_block_61(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_18(value) {
    		/*select_output_binding_18*/ ctx[80].call(null, value);
    	}

    	let select_props = {
    		label: "Select the BMMB account type you wish to open",
    		values: /*bmmb_account_type_options*/ ctx[22]
    	};

    	if (/*output*/ ctx[0].bmmb_account_type !== void 0) {
    		select_props.output = /*output*/ ctx[0].bmmb_account_type;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_18));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].bmmb_account_type;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_61.name,
    		type: "if",
    		source: "(2740:5) {#if form_display.bmmb_account_type.display}",
    		ctx
    	});

    	return block;
    }

    // (2747:5) {#if form_display.purpose_of_account.display}
    function create_if_block_60(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_19(value) {
    		/*select_output_binding_19*/ ctx[81].call(null, value);
    	}

    	let select_props = {
    		label: "Select purpose of account opening",
    		values: /*purpose_of_account_options*/ ctx[23]
    	};

    	if (/*output*/ ctx[0].purpose_of_account !== void 0) {
    		select_props.output = /*output*/ ctx[0].purpose_of_account;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_19));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].purpose_of_account;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_60.name,
    		type: "if",
    		source: "(2747:5) {#if form_display.purpose_of_account.display}",
    		ctx
    	});

    	return block;
    }

    // (2754:5) {#if form_display.product_to_open.display}
    function create_if_block_59(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_20(value) {
    		/*select_output_binding_20*/ ctx[82].call(null, value);
    	}

    	let select_props = {
    		label: "Select the product you wish to open",
    		values: /*product_to_open_options*/ ctx[24]
    	};

    	if (/*output*/ ctx[0].product_to_open !== void 0) {
    		select_props.output = /*output*/ ctx[0].product_to_open;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_20));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].product_to_open;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_59.name,
    		type: "if",
    		source: "(2754:5) {#if form_display.product_to_open.display}",
    		ctx
    	});

    	return block;
    }

    // (2761:5) {#if form_display.prefered_branch.display}
    function create_if_block_58(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_21(value) {
    		/*select_output_binding_21*/ ctx[83].call(null, value);
    	}

    	let select_props = {
    		label: "Prefered Branch",
    		values: /*prefered_branch_options*/ ctx[25]
    	};

    	if (/*output*/ ctx[0].prefered_branch !== void 0) {
    		select_props.output = /*output*/ ctx[0].prefered_branch;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_21));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].prefered_branch;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_58.name,
    		type: "if",
    		source: "(2761:5) {#if form_display.prefered_branch.display}",
    		ctx
    	});

    	return block;
    }

    // (2717:5) {#if form_display.contact_person_name.display}
    function create_if_block_56(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_19(value) {
    		/*input_output_binding_19*/ ctx[77].call(null, value);
    	}

    	let input_props = { label: "Contact Person Name" };

    	if (/*output*/ ctx[0].contact_person_name !== void 0) {
    		input_props.output = /*output*/ ctx[0].contact_person_name;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_19));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].contact_person_name;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_56.name,
    		type: "if",
    		source: "(2717:5) {#if form_display.contact_person_name.display}",
    		ctx
    	});

    	return block;
    }

    // (2723:5) {#if form_display.contact_relationship.display}
    function create_if_block_55(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_17(value) {
    		/*select_output_binding_17*/ ctx[78].call(null, value);
    	}

    	let select_props = {
    		label: "Relationship",
    		values: /*contact_relationship_options*/ ctx[21]
    	};

    	if (/*output*/ ctx[0].contact_relationship !== void 0) {
    		select_props.output = /*output*/ ctx[0].contact_relationship;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_17));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].contact_relationship;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_55.name,
    		type: "if",
    		source: "(2723:5) {#if form_display.contact_relationship.display}",
    		ctx
    	});

    	return block;
    }

    // (2730:5) {#if form_display.contact_mobile_number.display}
    function create_if_block_54(ctx) {
    	let number;
    	let updating_output;
    	let current;

    	function number_output_binding_9(value) {
    		/*number_output_binding_9*/ ctx[79].call(null, value);
    	}

    	let number_props = {
    		label: "Contact Person Mobile Number",
    		pattern: "[0-9]" + "{" + "10,11" + "}",
    		title: "Please enter your mobile number"
    	};

    	if (/*output*/ ctx[0].contact_mobile_number !== void 0) {
    		number_props.output = /*output*/ ctx[0].contact_mobile_number;
    	}

    	number = new Number({ props: number_props, $$inline: true });
    	binding_callbacks.push(() => bind(number, "output", number_output_binding_9));

    	const block = {
    		c: function create() {
    			create_component(number.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(number, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const number_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				number_changes.output = /*output*/ ctx[0].contact_mobile_number;
    				add_flush_callback(() => updating_output = false);
    			}

    			number.$set(number_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(number, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_54.name,
    		type: "if",
    		source: "(2730:5) {#if form_display.contact_mobile_number.display}",
    		ctx
    	});

    	return block;
    }

    // (2660:5) {#if form_display.mobile_number.display}
    function create_if_block_52(ctx) {
    	let number;
    	let updating_output;
    	let current;

    	function number_output_binding_6(value) {
    		/*number_output_binding_6*/ ctx[70].call(null, value);
    	}

    	let number_props = {
    		label: "Mobile Number",
    		pattern: "[0-9]" + "{" + "10,11" + "}",
    		title: "Please enter your mobile number"
    	};

    	if (/*output*/ ctx[0].mobile_number !== void 0) {
    		number_props.output = /*output*/ ctx[0].mobile_number;
    	}

    	number = new Number({ props: number_props, $$inline: true });
    	binding_callbacks.push(() => bind(number, "output", number_output_binding_6));

    	const block = {
    		c: function create() {
    			create_component(number.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(number, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const number_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				number_changes.output = /*output*/ ctx[0].mobile_number;
    				add_flush_callback(() => updating_output = false);
    			}

    			number.$set(number_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(number, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_52.name,
    		type: "if",
    		source: "(2660:5) {#if form_display.mobile_number.display}",
    		ctx
    	});

    	return block;
    }

    // (2668:5) {#if form_display.office_number.display}
    function create_if_block_51(ctx) {
    	let number;
    	let updating_output;
    	let current;

    	function number_output_binding_7(value) {
    		/*number_output_binding_7*/ ctx[71].call(null, value);
    	}

    	let number_props = {
    		label: "Office Number",
    		pattern: "[0-9]" + "{" + "10" + "}",
    		title: "Please enter your number of other banks used"
    	};

    	if (/*output*/ ctx[0].office_number !== void 0) {
    		number_props.output = /*output*/ ctx[0].office_number;
    	}

    	number = new Number({ props: number_props, $$inline: true });
    	binding_callbacks.push(() => bind(number, "output", number_output_binding_7));

    	const block = {
    		c: function create() {
    			create_component(number.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(number, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const number_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				number_changes.output = /*output*/ ctx[0].office_number;
    				add_flush_callback(() => updating_output = false);
    			}

    			number.$set(number_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(number, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_51.name,
    		type: "if",
    		source: "(2668:5) {#if form_display.office_number.display}",
    		ctx
    	});

    	return block;
    }

    // (2677:5) {#if form_display.email_address.display}
    function create_if_block_50(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_18(value) {
    		/*input_output_binding_18*/ ctx[72].call(null, value);
    	}

    	let input_props = { label: "Email Address" };

    	if (/*output*/ ctx[0].email_address !== void 0) {
    		input_props.output = /*output*/ ctx[0].email_address;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_18));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].email_address;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_50.name,
    		type: "if",
    		source: "(2677:5) {#if form_display.email_address.display}",
    		ctx
    	});

    	return block;
    }

    // (2684:5) {#if form_display.race.display}
    function create_if_block_49(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_14(value) {
    		/*select_output_binding_14*/ ctx[73].call(null, value);
    	}

    	let select_props = {
    		label: "Race",
    		values: /*race_options*/ ctx[18]
    	};

    	if (/*output*/ ctx[0].race !== void 0) {
    		select_props.output = /*output*/ ctx[0].race;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_14));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].race;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_49.name,
    		type: "if",
    		source: "(2684:5) {#if form_display.race.display}",
    		ctx
    	});

    	return block;
    }

    // (2691:5) {#if form_display.gender.display}
    function create_if_block_48(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_15(value) {
    		/*select_output_binding_15*/ ctx[74].call(null, value);
    	}

    	let select_props = {
    		label: "Gender",
    		values: /*gender_options*/ ctx[19]
    	};

    	if (/*output*/ ctx[0].gender !== void 0) {
    		select_props.output = /*output*/ ctx[0].gender;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_15));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].gender;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_48.name,
    		type: "if",
    		source: "(2691:5) {#if form_display.gender.display}",
    		ctx
    	});

    	return block;
    }

    // (2699:5) {#if form_display.maritial_status.display}
    function create_if_block_47(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_16(value) {
    		/*select_output_binding_16*/ ctx[75].call(null, value);
    	}

    	let select_props = {
    		label: "Maritial Status",
    		values: /*maritial_status_options*/ ctx[20]
    	};

    	if (/*output*/ ctx[0].maritial_status !== void 0) {
    		select_props.output = /*output*/ ctx[0].maritial_status;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_16));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].maritial_status;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_47.name,
    		type: "if",
    		source: "(2699:5) {#if form_display.maritial_status.display}",
    		ctx
    	});

    	return block;
    }

    // (2707:5) {#if form_display.no_of_dependents.display}
    function create_if_block_46(ctx) {
    	let number;
    	let updating_output;
    	let current;

    	function number_output_binding_8(value) {
    		/*number_output_binding_8*/ ctx[76].call(null, value);
    	}

    	let number_props = {
    		label: "Number of Dependents",
    		pattern: "[0-9]" + "{" + "2" + "}",
    		title: "Please enter your number of other banks used"
    	};

    	if (/*output*/ ctx[0].no_of_dependents !== void 0) {
    		number_props.output = /*output*/ ctx[0].no_of_dependents;
    	}

    	number = new Number({ props: number_props, $$inline: true });
    	binding_callbacks.push(() => bind(number, "output", number_output_binding_8));

    	const block = {
    		c: function create() {
    			create_component(number.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(number, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const number_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				number_changes.output = /*output*/ ctx[0].no_of_dependents;
    				add_flush_callback(() => updating_output = false);
    			}

    			number.$set(number_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(number, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_46.name,
    		type: "if",
    		source: "(2707:5) {#if form_display.no_of_dependents.display}",
    		ctx
    	});

    	return block;
    }

    // (2536:5) {#if form_display.bmmb_high_net_worth.display}
    function create_if_block_44(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_10(value) {
    		/*select_output_binding_10*/ ctx[51].call(null, value);
    	}

    	let select_props = {
    		label: "Are you one of BMMB High Net worth customer?",
    		values: /*bmmb_high_net_worth_options*/ ctx[15]
    	};

    	if (/*output*/ ctx[0].bmmb_high_net_worth !== void 0) {
    		select_props.output = /*output*/ ctx[0].bmmb_high_net_worth;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_10));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].bmmb_high_net_worth;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_44.name,
    		type: "if",
    		source: "(2536:5) {#if form_display.bmmb_high_net_worth.display}",
    		ctx
    	});

    	return block;
    }

    // (2543:5) {#if form_display.pep_related.display}
    function create_if_block_43(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_11(value) {
    		/*select_output_binding_11*/ ctx[52].call(null, value);
    	}

    	let select_props = {
    		label: "Are you a Political Expose Person (PEP) or a Family Member(s) of PEP or Related Close Assosiate(s) of PEP?",
    		values: /*pep_related_options*/ ctx[16]
    	};

    	if (/*output*/ ctx[0].pep_related !== void 0) {
    		select_props.output = /*output*/ ctx[0].pep_related;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_11));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].pep_related;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_43.name,
    		type: "if",
    		source: "(2543:5) {#if form_display.pep_related.display}",
    		ctx
    	});

    	return block;
    }

    // (2550:5) {#if form_display.local_address.display}
    function create_if_block_42(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_3(value) {
    		/*input_output_binding_3*/ ctx[53].call(null, value);
    	}

    	let input_props = { label: "Address" };

    	if (/*output*/ ctx[0].local_address !== void 0) {
    		input_props.output = /*output*/ ctx[0].local_address;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_3));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].local_address;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_42.name,
    		type: "if",
    		source: "(2550:5) {#if form_display.local_address.display}",
    		ctx
    	});

    	return block;
    }

    // (2556:5) {#if form_display.local_postal_code.display}
    function create_if_block_41(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_4(value) {
    		/*input_output_binding_4*/ ctx[54].call(null, value);
    	}

    	let input_props = { label: "Postal Code" };

    	if (/*output*/ ctx[0].local_postal_code !== void 0) {
    		input_props.output = /*output*/ ctx[0].local_postal_code;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_4));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].local_postal_code;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_41.name,
    		type: "if",
    		source: "(2556:5) {#if form_display.local_postal_code.display}",
    		ctx
    	});

    	return block;
    }

    // (2563:5) {#if form_display.local_city.display}
    function create_if_block_40(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_5(value) {
    		/*input_output_binding_5*/ ctx[55].call(null, value);
    	}

    	let input_props = { label: "City" };

    	if (/*output*/ ctx[0].local_city !== void 0) {
    		input_props.output = /*output*/ ctx[0].local_city;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_5));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].local_city;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_40.name,
    		type: "if",
    		source: "(2563:5) {#if form_display.local_city.display}",
    		ctx
    	});

    	return block;
    }

    // (2567:5) {#if form_display.local_state_code.display}
    function create_if_block_39(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_6(value) {
    		/*input_output_binding_6*/ ctx[56].call(null, value);
    	}

    	let input_props = { label: "State" };

    	if (/*output*/ ctx[0].local_state_code !== void 0) {
    		input_props.output = /*output*/ ctx[0].local_state_code;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_6));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].local_state_code;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_39.name,
    		type: "if",
    		source: "(2567:5) {#if form_display.local_state_code.display}",
    		ctx
    	});

    	return block;
    }

    // (2573:5) {#if form_display.local_coutry.display}
    function create_if_block_38(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_7(value) {
    		/*input_output_binding_7*/ ctx[57].call(null, value);
    	}

    	let input_props = { label: "Country" };

    	if (/*output*/ ctx[0].local_coutry !== void 0) {
    		input_props.output = /*output*/ ctx[0].local_coutry;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_7));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].local_coutry;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_38.name,
    		type: "if",
    		source: "(2573:5) {#if form_display.local_coutry.display}",
    		ctx
    	});

    	return block;
    }

    // (2579:5) {#if form_display.foreign_address.display}
    function create_if_block_37(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_8(value) {
    		/*input_output_binding_8*/ ctx[58].call(null, value);
    	}

    	let input_props = { label: "Foreign Address" };

    	if (/*output*/ ctx[0].foreign_address !== void 0) {
    		input_props.output = /*output*/ ctx[0].foreign_address;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_8));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].foreign_address;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_37.name,
    		type: "if",
    		source: "(2579:5) {#if form_display.foreign_address.display}",
    		ctx
    	});

    	return block;
    }

    // (2585:5) {#if form_display.foreign_postal_code.display}
    function create_if_block_36(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_9(value) {
    		/*input_output_binding_9*/ ctx[59].call(null, value);
    	}

    	let input_props = { label: "Foreign Postal Code" };

    	if (/*output*/ ctx[0].foreign_postal_code !== void 0) {
    		input_props.output = /*output*/ ctx[0].foreign_postal_code;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_9));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].foreign_postal_code;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_36.name,
    		type: "if",
    		source: "(2585:5) {#if form_display.foreign_postal_code.display}",
    		ctx
    	});

    	return block;
    }

    // (2592:5) {#if form_display.foreign_city.display}
    function create_if_block_35(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_10(value) {
    		/*input_output_binding_10*/ ctx[60].call(null, value);
    	}

    	let input_props = { label: "Foreign City" };

    	if (/*output*/ ctx[0].foreign_city !== void 0) {
    		input_props.output = /*output*/ ctx[0].foreign_city;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_10));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].foreign_city;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_35.name,
    		type: "if",
    		source: "(2592:5) {#if form_display.foreign_city.display}",
    		ctx
    	});

    	return block;
    }

    // (2599:5) {#if form_display.foreign_state_code.display}
    function create_if_block_34(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_11(value) {
    		/*input_output_binding_11*/ ctx[61].call(null, value);
    	}

    	let input_props = { label: "Foreign State" };

    	if (/*output*/ ctx[0].foreign_state_code !== void 0) {
    		input_props.output = /*output*/ ctx[0].foreign_state_code;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_11));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].foreign_state_code;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_34.name,
    		type: "if",
    		source: "(2599:5) {#if form_display.foreign_state_code.display}",
    		ctx
    	});

    	return block;
    }

    // (2605:5) {#if form_display.foreign_coutry.display}
    function create_if_block_33(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_12(value) {
    		/*input_output_binding_12*/ ctx[62].call(null, value);
    	}

    	let input_props = { label: "Foreign Country" };

    	if (/*output*/ ctx[0].foreign_coutry !== void 0) {
    		input_props.output = /*output*/ ctx[0].foreign_coutry;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_12));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].foreign_coutry;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_33.name,
    		type: "if",
    		source: "(2605:5) {#if form_display.foreign_coutry.display}",
    		ctx
    	});

    	return block;
    }

    // (2618:5) {#if form_display.mailing_address.display}
    function create_if_block_32(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_13(value) {
    		/*input_output_binding_13*/ ctx[64].call(null, value);
    	}

    	let input_props = { label: "Mailing Address" };

    	if (/*output*/ ctx[0].mailing_address !== void 0) {
    		input_props.output = /*output*/ ctx[0].mailing_address;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_13));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].mailing_address;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_32.name,
    		type: "if",
    		source: "(2618:5) {#if form_display.mailing_address.display}",
    		ctx
    	});

    	return block;
    }

    // (2624:5) {#if form_display.mailing_postal_code.display}
    function create_if_block_31(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_14(value) {
    		/*input_output_binding_14*/ ctx[65].call(null, value);
    	}

    	let input_props = { label: "Mailing Postal Code" };

    	if (/*output*/ ctx[0].mailing_postal_code !== void 0) {
    		input_props.output = /*output*/ ctx[0].mailing_postal_code;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_14));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].mailing_postal_code;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_31.name,
    		type: "if",
    		source: "(2624:5) {#if form_display.mailing_postal_code.display}",
    		ctx
    	});

    	return block;
    }

    // (2631:5) {#if form_display.mailing_city.display}
    function create_if_block_30(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_15(value) {
    		/*input_output_binding_15*/ ctx[66].call(null, value);
    	}

    	let input_props = { label: "Mailing City" };

    	if (/*output*/ ctx[0].mailing_city !== void 0) {
    		input_props.output = /*output*/ ctx[0].mailing_city;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_15));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].mailing_city;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_30.name,
    		type: "if",
    		source: "(2631:5) {#if form_display.mailing_city.display}",
    		ctx
    	});

    	return block;
    }

    // (2638:5) {#if form_display.mailing_state_code.display}
    function create_if_block_29(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_16(value) {
    		/*input_output_binding_16*/ ctx[67].call(null, value);
    	}

    	let input_props = { label: "Mailing State" };

    	if (/*output*/ ctx[0].mailing_state_code !== void 0) {
    		input_props.output = /*output*/ ctx[0].mailing_state_code;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_16));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].mailing_state_code;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_29.name,
    		type: "if",
    		source: "(2638:5) {#if form_display.mailing_state_code.display}",
    		ctx
    	});

    	return block;
    }

    // (2644:5) {#if form_display.mailing_coutry.display}
    function create_if_block_28(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_17(value) {
    		/*input_output_binding_17*/ ctx[68].call(null, value);
    	}

    	let input_props = { label: "Mailing Country" };

    	if (/*output*/ ctx[0].mailing_coutry !== void 0) {
    		input_props.output = /*output*/ ctx[0].mailing_coutry;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_17));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].mailing_coutry;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_28.name,
    		type: "if",
    		source: "(2644:5) {#if form_display.mailing_coutry.display}",
    		ctx
    	});

    	return block;
    }

    // (2651:5) {#if form_display.property_ownership.display}
    function create_if_block_27(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_13(value) {
    		/*select_output_binding_13*/ ctx[69].call(null, value);
    	}

    	let select_props = {
    		label: "Property Ownership",
    		values: /*property_ownership_options*/ ctx[17]
    	};

    	if (/*output*/ ctx[0].property_ownership !== void 0) {
    		select_props.output = /*output*/ ctx[0].property_ownership;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_13));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].property_ownership;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_27.name,
    		type: "if",
    		source: "(2651:5) {#if form_display.property_ownership.display}",
    		ctx
    	});

    	return block;
    }

    // (2447:5) {#if form_display.educations_detail.display}
    function create_if_block_25(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_3(value) {
    		/*select_output_binding_3*/ ctx[39].call(null, value);
    	}

    	let select_props = {
    		label: "Education Level",
    		values: /*educations_detail_options*/ ctx[8]
    	};

    	if (/*output*/ ctx[0].educations_detail !== void 0) {
    		select_props.output = /*output*/ ctx[0].educations_detail;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_3));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].educations_detail;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(2447:5) {#if form_display.educations_detail.display}",
    		ctx
    	});

    	return block;
    }

    // (2454:5) {#if form_display.occupation.display}
    function create_if_block_24(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_4(value) {
    		/*select_output_binding_4*/ ctx[40].call(null, value);
    	}

    	let select_props = {
    		label: "Occupation",
    		values: /*occupation_options*/ ctx[9]
    	};

    	if (/*output*/ ctx[0].occupation !== void 0) {
    		select_props.output = /*output*/ ctx[0].occupation;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_4));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].occupation;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(2454:5) {#if form_display.occupation.display}",
    		ctx
    	});

    	return block;
    }

    // (2461:5) {#if form_display.job_title.display}
    function create_if_block_23(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_5(value) {
    		/*select_output_binding_5*/ ctx[41].call(null, value);
    	}

    	let select_props = {
    		label: "Job Title",
    		values: /*job_title_options*/ ctx[10]
    	};

    	if (/*output*/ ctx[0].job_title !== void 0) {
    		select_props.output = /*output*/ ctx[0].job_title;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_5));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].job_title;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(2461:5) {#if form_display.job_title.display}",
    		ctx
    	});

    	return block;
    }

    // (2468:5) {#if form_display.bmmb_staff.display}
    function create_if_block_22(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_6(value) {
    		/*select_output_binding_6*/ ctx[42].call(null, value);
    	}

    	let select_props = {
    		label: "BMMB Staff?",
    		values: /*bmmb_staff_options*/ ctx[11]
    	};

    	if (/*output*/ ctx[0].bmmb_staff !== void 0) {
    		select_props.output = /*output*/ ctx[0].bmmb_staff;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_6));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].bmmb_staff;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(2468:5) {#if form_display.bmmb_staff.display}",
    		ctx
    	});

    	return block;
    }

    // (2475:5) {#if form_display.bmmb_staff_id.display}
    function create_if_block_21(ctx) {
    	let number;
    	let updating_output;
    	let current;

    	function number_output_binding_2(value) {
    		/*number_output_binding_2*/ ctx[43].call(null, value);
    	}

    	let number_props = {
    		label: "BMMB Staff ID Number",
    		pattern: "[0-9]" + "{" + "6" + "}",
    		title: "Please enter your id number"
    	};

    	if (/*output*/ ctx[0].bmmb_staff_id !== void 0) {
    		number_props.output = /*output*/ ctx[0].bmmb_staff_id;
    	}

    	number = new Number({ props: number_props, $$inline: true });
    	binding_callbacks.push(() => bind(number, "output", number_output_binding_2));

    	const block = {
    		c: function create() {
    			create_component(number.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(number, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const number_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				number_changes.output = /*output*/ ctx[0].bmmb_staff_id;
    				add_flush_callback(() => updating_output = false);
    			}

    			number.$set(number_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(number, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(2475:5) {#if form_display.bmmb_staff_id.display}",
    		ctx
    	});

    	return block;
    }

    // (2483:5) {#if form_display.employment_type.display}
    function create_if_block_20(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_7(value) {
    		/*select_output_binding_7*/ ctx[44].call(null, value);
    	}

    	let select_props = {
    		label: "Employment Type",
    		values: /*employment_type_options*/ ctx[12]
    	};

    	if (/*output*/ ctx[0].employment_type !== void 0) {
    		select_props.output = /*output*/ ctx[0].employment_type;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_7));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].employment_type;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(2483:5) {#if form_display.employment_type.display}",
    		ctx
    	});

    	return block;
    }

    // (2490:5) {#if form_display.employment_sector.display}
    function create_if_block_19(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_8(value) {
    		/*select_output_binding_8*/ ctx[45].call(null, value);
    	}

    	let select_props = {
    		label: "Employment Sector",
    		values: /*employment_sector_options*/ ctx[13]
    	};

    	if (/*output*/ ctx[0].employment_sector !== void 0) {
    		select_props.output = /*output*/ ctx[0].employment_sector;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_8));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].employment_sector;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(2490:5) {#if form_display.employment_sector.display}",
    		ctx
    	});

    	return block;
    }

    // (2497:5) {#if form_display.monthly_basic_salary.display}
    function create_if_block_18(ctx) {
    	let number;
    	let updating_output;
    	let current;

    	function number_output_binding_3(value) {
    		/*number_output_binding_3*/ ctx[46].call(null, value);
    	}

    	let number_props = {
    		label: "Monthly Basic Salary",
    		pattern: "[0-9]" + "{" + "7" + "}",
    		title: "Please enter your monthly basic salary"
    	};

    	if (/*output*/ ctx[0].monthly_basic_salary !== void 0) {
    		number_props.output = /*output*/ ctx[0].monthly_basic_salary;
    	}

    	number = new Number({ props: number_props, $$inline: true });
    	binding_callbacks.push(() => bind(number, "output", number_output_binding_3));

    	const block = {
    		c: function create() {
    			create_component(number.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(number, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const number_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				number_changes.output = /*output*/ ctx[0].monthly_basic_salary;
    				add_flush_callback(() => updating_output = false);
    			}

    			number.$set(number_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(number, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(2497:5) {#if form_display.monthly_basic_salary.display}",
    		ctx
    	});

    	return block;
    }

    // (2505:5) {#if form_display.monthly_other_salary.display}
    function create_if_block_17(ctx) {
    	let number;
    	let updating_output;
    	let current;

    	function number_output_binding_4(value) {
    		/*number_output_binding_4*/ ctx[47].call(null, value);
    	}

    	let number_props = {
    		label: "Monthly Other Salary",
    		pattern: "[0-9]" + "{" + "7" + "}",
    		title: "Please enter your monthly other salary"
    	};

    	if (/*output*/ ctx[0].monthly_other_salary !== void 0) {
    		number_props.output = /*output*/ ctx[0].monthly_other_salary;
    	}

    	number = new Number({ props: number_props, $$inline: true });
    	binding_callbacks.push(() => bind(number, "output", number_output_binding_4));

    	const block = {
    		c: function create() {
    			create_component(number.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(number, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const number_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				number_changes.output = /*output*/ ctx[0].monthly_other_salary;
    				add_flush_callback(() => updating_output = false);
    			}

    			number.$set(number_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(number, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(2505:5) {#if form_display.monthly_other_salary.display}",
    		ctx
    	});

    	return block;
    }

    // (2513:5) {#if form_display.employer_name.display}
    function create_if_block_16(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_2(value) {
    		/*input_output_binding_2*/ ctx[48].call(null, value);
    	}

    	let input_props = { label: "Employer Name" };

    	if (/*output*/ ctx[0].employer_name !== void 0) {
    		input_props.output = /*output*/ ctx[0].employer_name;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_2));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].employer_name;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(2513:5) {#if form_display.employer_name.display}",
    		ctx
    	});

    	return block;
    }

    // (2519:5) {#if form_display.nature_of_business.display}
    function create_if_block_15(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_9(value) {
    		/*select_output_binding_9*/ ctx[49].call(null, value);
    	}

    	let select_props = {
    		label: "Nature Of Business",
    		values: /*nature_of_business_options*/ ctx[14]
    	};

    	if (/*output*/ ctx[0].nature_of_business !== void 0) {
    		select_props.output = /*output*/ ctx[0].nature_of_business;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_9));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].nature_of_business;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(2519:5) {#if form_display.nature_of_business.display}",
    		ctx
    	});

    	return block;
    }

    // (2526:5) {#if form_display.no_of_other_banks_used.display}
    function create_if_block_14(ctx) {
    	let number;
    	let updating_output;
    	let current;

    	function number_output_binding_5(value) {
    		/*number_output_binding_5*/ ctx[50].call(null, value);
    	}

    	let number_props = {
    		label: "No. of Other Banks Used",
    		pattern: "[0-9]" + "{" + "7" + "}",
    		title: "Please enter your number of other banks used"
    	};

    	if (/*output*/ ctx[0].no_of_other_banks_used !== void 0) {
    		number_props.output = /*output*/ ctx[0].no_of_other_banks_used;
    	}

    	number = new Number({ props: number_props, $$inline: true });
    	binding_callbacks.push(() => bind(number, "output", number_output_binding_5));

    	const block = {
    		c: function create() {
    			create_component(number.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(number, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const number_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				number_changes.output = /*output*/ ctx[0].no_of_other_banks_used;
    				add_flush_callback(() => updating_output = false);
    			}

    			number.$set(number_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(number, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(2526:5) {#if form_display.no_of_other_banks_used.display}",
    		ctx
    	});

    	return block;
    }

    // (2375:5) {#if form_display.us_related.display}
    function create_if_block_12(ctx) {
    	let radio;
    	let updating_output;
    	let current;

    	function radio_output_binding(value) {
    		/*radio_output_binding*/ ctx[29].call(null, value);
    	}

    	let radio_props = {
    		label: "Are you a US Citizen or US Indicia"
    	};

    	if (/*output*/ ctx[0].us_related !== void 0) {
    		radio_props.output = /*output*/ ctx[0].us_related;
    	}

    	radio = new Radio({ props: radio_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio, "output", radio_output_binding));

    	const block = {
    		c: function create() {
    			create_component(radio.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				radio_changes.output = /*output*/ ctx[0].us_related;
    				add_flush_callback(() => updating_output = false);
    			}

    			radio.$set(radio_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(2375:5) {#if form_display.us_related.display}",
    		ctx
    	});

    	return block;
    }

    // (2381:5) {#if form_display.full_name.display}
    function create_if_block_11(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding(value) {
    		/*input_output_binding*/ ctx[30].call(null, value);
    	}

    	let input_props = { label: "Full Name" };

    	if (/*output*/ ctx[0].full_name !== void 0) {
    		input_props.output = /*output*/ ctx[0].full_name;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].full_name;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(2381:5) {#if form_display.full_name.display}",
    		ctx
    	});

    	return block;
    }

    // (2387:5) {#if form_display.type_of_id.display}
    function create_if_block_10(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding(value) {
    		/*select_output_binding*/ ctx[31].call(null, value);
    	}

    	let select_props = {
    		label: "Type of Identifications (ID)",
    		values: /*id_type_options*/ ctx[5]
    	};

    	if (/*output*/ ctx[0].type_of_id !== void 0) {
    		select_props.output = /*output*/ ctx[0].type_of_id;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].type_of_id;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(2387:5) {#if form_display.type_of_id.display}",
    		ctx
    	});

    	return block;
    }

    // (2394:5) {#if form_display.id_number.display}
    function create_if_block_9(ctx) {
    	let number;
    	let updating_output;
    	let current;

    	function number_output_binding(value) {
    		/*number_output_binding*/ ctx[32].call(null, value);
    	}

    	let number_props = {
    		label: "ID Number",
    		pattern: "[0-9]" + "{" + "12" + "}",
    		title: "Please enter your id number"
    	};

    	if (/*output*/ ctx[0].id_number !== void 0) {
    		number_props.output = /*output*/ ctx[0].id_number;
    	}

    	number = new Number({ props: number_props, $$inline: true });
    	binding_callbacks.push(() => bind(number, "output", number_output_binding));

    	const block = {
    		c: function create() {
    			create_component(number.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(number, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const number_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				number_changes.output = /*output*/ ctx[0].id_number;
    				add_flush_callback(() => updating_output = false);
    			}

    			number.$set(number_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(number, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(2394:5) {#if form_display.id_number.display}",
    		ctx
    	});

    	return block;
    }

    // (2402:5) {#if form_display.passport_number.display}
    function create_if_block_8(ctx) {
    	let number;
    	let updating_output;
    	let current;

    	function number_output_binding_1(value) {
    		/*number_output_binding_1*/ ctx[33].call(null, value);
    	}

    	let number_props = {
    		label: "Passport Number",
    		pattern: "[0-9]" + "{" + "12" + "}",
    		title: "Please enter your id number"
    	};

    	if (/*output*/ ctx[0].passport_number !== void 0) {
    		number_props.output = /*output*/ ctx[0].passport_number;
    	}

    	number = new Number({ props: number_props, $$inline: true });
    	binding_callbacks.push(() => bind(number, "output", number_output_binding_1));

    	const block = {
    		c: function create() {
    			create_component(number.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(number, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const number_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				number_changes.output = /*output*/ ctx[0].passport_number;
    				add_flush_callback(() => updating_output = false);
    			}

    			number.$set(number_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(number, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(2402:5) {#if form_display.passport_number.display}",
    		ctx
    	});

    	return block;
    }

    // (2410:5) {#if form_display.nationality.display}
    function create_if_block_7(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_1(value) {
    		/*select_output_binding_1*/ ctx[34].call(null, value);
    	}

    	let select_props = {
    		label: "Nationality",
    		values: /*nationality_options*/ ctx[6],
    		disabled: /*form_display*/ ctx[1].nationality.disable
    	};

    	if (/*output*/ ctx[0].nationality !== void 0) {
    		select_props.output = /*output*/ ctx[0].nationality;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_1));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty[0] & /*form_display*/ 2) select_changes.disabled = /*form_display*/ ctx[1].nationality.disable;

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].nationality;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(2410:5) {#if form_display.nationality.display}",
    		ctx
    	});

    	return block;
    }

    // (2418:5) {#if form_display.pr_status.display}
    function create_if_block_6(ctx) {
    	let radio;
    	let updating_output;
    	let current;

    	function radio_output_binding_1(value) {
    		/*radio_output_binding_1*/ ctx[35].call(null, value);
    	}

    	let radio_props = {
    		label: "PR Status",
    		values: /*pr_status_options*/ ctx[7]
    	};

    	if (/*output*/ ctx[0].pr_status !== void 0) {
    		radio_props.output = /*output*/ ctx[0].pr_status;
    	}

    	radio = new Radio({ props: radio_props, $$inline: true });
    	binding_callbacks.push(() => bind(radio, "output", radio_output_binding_1));

    	const block = {
    		c: function create() {
    			create_component(radio.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radio, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radio_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				radio_changes.output = /*output*/ ctx[0].pr_status;
    				add_flush_callback(() => updating_output = false);
    			}

    			radio.$set(radio_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radio.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radio.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radio, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(2418:5) {#if form_display.pr_status.display}",
    		ctx
    	});

    	return block;
    }

    // (2425:5) {#if form_display.pr_id_number.display}
    function create_if_block_5(ctx) {
    	let input;
    	let updating_output;
    	let current;

    	function input_output_binding_1(value) {
    		/*input_output_binding_1*/ ctx[36].call(null, value);
    	}

    	let input_props = { label: "PR ID Number" };

    	if (/*output*/ ctx[0].pr_id_number !== void 0) {
    		input_props.output = /*output*/ ctx[0].pr_id_number;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "output", input_output_binding_1));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				input_changes.output = /*output*/ ctx[0].pr_id_number;
    				add_flush_callback(() => updating_output = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(2425:5) {#if form_display.pr_id_number.display}",
    		ctx
    	});

    	return block;
    }

    // (2431:5) {#if form_display.pr_country.display}
    function create_if_block_4(ctx) {
    	let select;
    	let updating_output;
    	let current;

    	function select_output_binding_2(value) {
    		/*select_output_binding_2*/ ctx[37].call(null, value);
    	}

    	let select_props = {
    		label: "PR County",
    		values: /*nationality_options*/ ctx[6]
    	};

    	if (/*output*/ ctx[0].pr_country !== void 0) {
    		select_props.output = /*output*/ ctx[0].pr_country;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "output", select_output_binding_2));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				select_changes.output = /*output*/ ctx[0].pr_country;
    				add_flush_callback(() => updating_output = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(2431:5) {#if form_display.pr_country.display}",
    		ctx
    	});

    	return block;
    }

    // (2438:5) {#if form_display.date_of_birth.display}
    function create_if_block_3(ctx) {
    	let date;
    	let updating_output;
    	let current;

    	function date_output_binding(value) {
    		/*date_output_binding*/ ctx[38].call(null, value);
    	}

    	let date_props = {
    		label: "Date Of Birth",
    		disabled: /*form_display*/ ctx[1].date_of_birth.disable
    	};

    	if (/*output*/ ctx[0].date_of_birth !== void 0) {
    		date_props.output = /*output*/ ctx[0].date_of_birth;
    	}

    	date = new Date({ props: date_props, $$inline: true });
    	binding_callbacks.push(() => bind(date, "output", date_output_binding));

    	const block = {
    		c: function create() {
    			create_component(date.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(date, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const date_changes = {};
    			if (dirty[0] & /*form_display*/ 2) date_changes.disabled = /*form_display*/ ctx[1].date_of_birth.disable;

    			if (!updating_output && dirty[0] & /*output*/ 1) {
    				updating_output = true;
    				date_changes.output = /*output*/ ctx[0].date_of_birth;
    				add_flush_callback(() => updating_output = false);
    			}

    			date.$set(date_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(date.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(date.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(date, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(2438:5) {#if form_display.date_of_birth.display}",
    		ctx
    	});

    	return block;
    }

    // (2771:4) {#if step >= 2}
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Previous";
    			attr_dev(button, "type", "button");
    			add_location(button, file$6, 2770, 19, 49675);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*prev_page*/ ctx[27], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(2771:4) {#if step >= 2}",
    		ctx
    	});

    	return block;
    }

    // (2774:4) {#if step < last_step}
    function create_if_block$2(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Next");
    			attr_dev(button, "type", "button");
    			button.disabled = /*next_disabled*/ ctx[3];
    			add_location(button, file$6, 2774, 5, 49786);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*next_page*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*next_disabled*/ 8) {
    				prop_dev(button, "disabled", /*next_disabled*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(2774:4) {#if step < last_step}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let link;
    	let t0;
    	let div72;
    	let div24;
    	let div23;
    	let div22;
    	let div21;
    	let h10;
    	let t2;
    	let h4;
    	let t4;
    	let div1;
    	let div0;
    	let p0;
    	let t6;
    	let div5;
    	let div4;
    	let div2;
    	let label0;
    	let input0;
    	let t7;
    	let t8;
    	let div3;
    	let label1;
    	let input1;
    	let t9;
    	let t10;
    	let div8;
    	let div7;
    	let div6;
    	let label2;
    	let t12;
    	let input2;
    	let t13;
    	let small;
    	let t15;
    	let div13;
    	let div10;
    	let div9;
    	let label3;
    	let t17;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let t23;
    	let div12;
    	let div11;
    	let label4;
    	let t25;
    	let input3;
    	let t26;
    	let div18;
    	let div15;
    	let div14;
    	let label5;
    	let t28;
    	let select1;
    	let option5;
    	let option6;
    	let option7;
    	let t32;
    	let div17;
    	let div16;
    	let label6;
    	let t34;
    	let input4;
    	let t35;
    	let div20;
    	let div19;
    	let a;
    	let t37;
    	let div71;
    	let div70;
    	let div69;
    	let div68;
    	let h2;
    	let t39;
    	let div27;
    	let div26;
    	let div25;
    	let label7;
    	let t41;
    	let select2;
    	let option8;
    	let option9;
    	let option10;
    	let option11;
    	let option12;
    	let option13;
    	let option14;
    	let option15;
    	let option16;
    	let option17;
    	let t52;
    	let div32;
    	let div29;
    	let div28;
    	let label8;
    	let t54;
    	let select3;
    	let option18;
    	let option19;
    	let option20;
    	let t58;
    	let div31;
    	let div30;
    	let label9;
    	let t60;
    	let select4;
    	let option21;
    	let option22;
    	let option23;
    	let option24;
    	let t65;
    	let div34;
    	let div33;
    	let p1;
    	let t67;
    	let div38;
    	let div37;
    	let div35;
    	let label10;
    	let input5;
    	let t68;
    	let t69;
    	let div36;
    	let label11;
    	let input6;
    	let t70;
    	let t71;
    	let div41;
    	let div40;
    	let div39;
    	let label12;
    	let t73;
    	let input7;
    	let t74;
    	let div46;
    	let div43;
    	let div42;
    	let label13;
    	let t76;
    	let input8;
    	let t77;
    	let div45;
    	let div44;
    	let label14;
    	let t79;
    	let input9;
    	let t80;
    	let div49;
    	let div48;
    	let div47;
    	let label15;
    	let t82;
    	let input10;
    	let t83;
    	let div54;
    	let div51;
    	let div50;
    	let label16;
    	let t85;
    	let input11;
    	let t86;
    	let div53;
    	let div52;
    	let label17;
    	let t88;
    	let input12;
    	let t89;
    	let div59;
    	let div56;
    	let div55;
    	let label18;
    	let t91;
    	let input13;
    	let t92;
    	let div58;
    	let div57;
    	let label19;
    	let t94;
    	let input14;
    	let t95;
    	let div64;
    	let div61;
    	let div60;
    	let label20;
    	let t97;
    	let input15;
    	let t98;
    	let div63;
    	let div62;
    	let label21;
    	let t100;
    	let input16;
    	let t101;
    	let div67;
    	let div66;
    	let div65;
    	let label22;
    	let t103;
    	let input17;
    	let t104;
    	let div75;
    	let div74;
    	let div73;
    	let form;
    	let h11;
    	let t106;
    	let current_block_type_index;
    	let if_block0;
    	let t107;
    	let t108;
    	let t109;
    	let br0;
    	let t110;
    	let br1;
    	let current;

    	const if_block_creators = [
    		create_if_block_2,
    		create_if_block_13,
    		create_if_block_26,
    		create_if_block_45,
    		create_if_block_53,
    		create_if_block_57,
    		create_if_block_62
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*step*/ ctx[2] == 1) return 0;
    		if (/*step*/ ctx[2] == 2) return 1;
    		if (/*step*/ ctx[2] == 3) return 2;
    		if (/*step*/ ctx[2] == 4) return 3;
    		if (/*step*/ ctx[2] == 5) return 4;
    		if (/*step*/ ctx[2] == 6) return 5;
    		if (/*step*/ ctx[2] == 7) return 6;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*step*/ ctx[2] >= 2 && create_if_block_1(ctx);
    	let if_block2 = /*step*/ ctx[2] < /*last_step*/ ctx[4] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div72 = element("div");
    			div24 = element("div");
    			div23 = element("div");
    			div22 = element("div");
    			div21 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Saving Application Application";
    			t2 = space();
    			h4 = element("h4");
    			h4.textContent = "Basic Informations";
    			t4 = space();
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Are you a US Citizen or US Indicia:";
    			t6 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			label0 = element("label");
    			input0 = element("input");
    			t7 = text("\n\t\t\t\t\t\t\t\tYes");
    			t8 = space();
    			div3 = element("div");
    			label1 = element("label");
    			input1 = element("input");
    			t9 = text("\n\t\t\t\t\t\t\t\tNo");
    			t10 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			label2 = element("label");
    			label2.textContent = "Full Name";
    			t12 = space();
    			input2 = element("input");
    			t13 = space();
    			small = element("small");
    			small.textContent = "Please ensure name as per MyKad";
    			t15 = space();
    			div13 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			label3 = element("label");
    			label3.textContent = "Type of Identification";
    			t17 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "MyKad";
    			option1 = element("option");
    			option1.textContent = "Army Personnel";
    			option2 = element("option");
    			option2.textContent = "Police Personnel";
    			option3 = element("option");
    			option3.textContent = "My PR";
    			option4 = element("option");
    			option4.textContent = "Passport";
    			t23 = space();
    			div12 = element("div");
    			div11 = element("div");
    			label4 = element("label");
    			label4.textContent = "ID Number";
    			t25 = space();
    			input3 = element("input");
    			t26 = space();
    			div18 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			label5 = element("label");
    			label5.textContent = "Nationality";
    			t28 = space();
    			select1 = element("select");
    			option5 = element("option");
    			option5.textContent = "--Please Select--";
    			option6 = element("option");
    			option6.textContent = "AFGHANISTAN";
    			option7 = element("option");
    			option7.textContent = "MALAYSIA";
    			t32 = space();
    			div17 = element("div");
    			div16 = element("div");
    			label6 = element("label");
    			label6.textContent = "Date of Birth";
    			t34 = space();
    			input4 = element("input");
    			t35 = space();
    			div20 = element("div");
    			div19 = element("div");
    			a = element("a");
    			a.textContent = "Next";
    			t37 = space();
    			div71 = element("div");
    			div70 = element("div");
    			div69 = element("div");
    			div68 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Employment Details";
    			t39 = space();
    			div27 = element("div");
    			div26 = element("div");
    			div25 = element("div");
    			label7 = element("label");
    			label7.textContent = "Educational Level";
    			t41 = space();
    			select2 = element("select");
    			option8 = element("option");
    			option8.textContent = "--Please Select--";
    			option9 = element("option");
    			option9.textContent = "Primary";
    			option10 = element("option");
    			option10.textContent = "Secondary";
    			option11 = element("option");
    			option11.textContent = "Certificate";
    			option12 = element("option");
    			option12.textContent = "Pre-University";
    			option13 = element("option");
    			option13.textContent = "Diploma";
    			option14 = element("option");
    			option14.textContent = "Degree";
    			option15 = element("option");
    			option15.textContent = "Master";
    			option16 = element("option");
    			option16.textContent = "Doctorate";
    			option17 = element("option");
    			option17.textContent = "Professional";
    			t52 = space();
    			div32 = element("div");
    			div29 = element("div");
    			div28 = element("div");
    			label8 = element("label");
    			label8.textContent = "Occupation";
    			t54 = space();
    			select3 = element("select");
    			option18 = element("option");
    			option18.textContent = "--Please Select--";
    			option19 = element("option");
    			option19.textContent = "Accountant";
    			option20 = element("option");
    			option20.textContent = "Housewife/Househusband";
    			t58 = space();
    			div31 = element("div");
    			div30 = element("div");
    			label9 = element("label");
    			label9.textContent = "Job Title";
    			t60 = space();
    			select4 = element("select");
    			option21 = element("option");
    			option21.textContent = "--Please Select--";
    			option22 = element("option");
    			option22.textContent = "Officer";
    			option23 = element("option");
    			option23.textContent = "Manager";
    			option24 = element("option");
    			option24.textContent = "Professional";
    			t65 = space();
    			div34 = element("div");
    			div33 = element("div");
    			p1 = element("p");
    			p1.textContent = "BMMB Staff?";
    			t67 = space();
    			div38 = element("div");
    			div37 = element("div");
    			div35 = element("div");
    			label10 = element("label");
    			input5 = element("input");
    			t68 = text("\n\t\t\t\t\t\t\t\tYes");
    			t69 = space();
    			div36 = element("div");
    			label11 = element("label");
    			input6 = element("input");
    			t70 = text("\n\t\t\t\t\t\t\t\tNo");
    			t71 = space();
    			div41 = element("div");
    			div40 = element("div");
    			div39 = element("div");
    			label12 = element("label");
    			label12.textContent = "BMMB Staff ID:";
    			t73 = space();
    			input7 = element("input");
    			t74 = space();
    			div46 = element("div");
    			div43 = element("div");
    			div42 = element("div");
    			label13 = element("label");
    			label13.textContent = "Monthly Basic Salary:";
    			t76 = space();
    			input8 = element("input");
    			t77 = space();
    			div45 = element("div");
    			div44 = element("div");
    			label14 = element("label");
    			label14.textContent = "Monthly Other Salary:";
    			t79 = space();
    			input9 = element("input");
    			t80 = space();
    			div49 = element("div");
    			div48 = element("div");
    			div47 = element("div");
    			label15 = element("label");
    			label15.textContent = "No. of Other Banks Used:";
    			t82 = space();
    			input10 = element("input");
    			t83 = space();
    			div54 = element("div");
    			div51 = element("div");
    			div50 = element("div");
    			label16 = element("label");
    			label16.textContent = "Employment Type:";
    			t85 = space();
    			input11 = element("input");
    			t86 = space();
    			div53 = element("div");
    			div52 = element("div");
    			label17 = element("label");
    			label17.textContent = "Employment Sector:";
    			t88 = space();
    			input12 = element("input");
    			t89 = space();
    			div59 = element("div");
    			div56 = element("div");
    			div55 = element("div");
    			label18 = element("label");
    			label18.textContent = "Monthly Basic Salary:";
    			t91 = space();
    			input13 = element("input");
    			t92 = space();
    			div58 = element("div");
    			div57 = element("div");
    			label19 = element("label");
    			label19.textContent = "Monthly Other Salary:";
    			t94 = space();
    			input14 = element("input");
    			t95 = space();
    			div64 = element("div");
    			div61 = element("div");
    			div60 = element("div");
    			label20 = element("label");
    			label20.textContent = "Employer Name:";
    			t97 = space();
    			input15 = element("input");
    			t98 = space();
    			div63 = element("div");
    			div62 = element("div");
    			label21 = element("label");
    			label21.textContent = "Nature of Business:";
    			t100 = space();
    			input16 = element("input");
    			t101 = space();
    			div67 = element("div");
    			div66 = element("div");
    			div65 = element("div");
    			label22 = element("label");
    			label22.textContent = "No. of Other Banks Used:";
    			t103 = space();
    			input17 = element("input");
    			t104 = space();
    			div75 = element("div");
    			div74 = element("div");
    			div73 = element("div");
    			form = element("form");
    			h11 = element("h1");
    			h11.textContent = "DOA Form";
    			t106 = space();
    			if (if_block0) if_block0.c();
    			t107 = space();
    			if (if_block1) if_block1.c();
    			t108 = space();
    			if (if_block2) if_block2.c();
    			t109 = space();
    			br0 = element("br");
    			t110 = space();
    			br1 = element("br");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css");
    			add_location(link, file$6, 2107, 1, 30259);
    			attr_dev(h10, "class", "card-title");
    			add_location(h10, file$6, 2118, 5, 30526);
    			attr_dev(h4, "class", "card-text");
    			add_location(h4, file$6, 2119, 5, 30590);
    			add_location(p0, file$6, 2123, 7, 30698);
    			attr_dev(div0, "class", "col-md-6");
    			add_location(div0, file$6, 2122, 6, 30668);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$6, 2121, 5, 30644);
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "class", "form-check-input");
    			attr_dev(input0, "name", "RadioBtnCitizen");
    			attr_dev(input0, "id", "citizenYes");
    			input0.value = "checkedValue";
    			input0.checked = true;
    			add_location(input0, file$6, 2130, 8, 30899);
    			attr_dev(label0, "class", "form-check-label");
    			add_location(label0, file$6, 2129, 8, 30858);
    			attr_dev(div2, "class", "form-check");
    			add_location(div2, file$6, 2128, 7, 30825);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "class", "form-check-input");
    			attr_dev(input1, "name", "RadioBtnCitizen");
    			attr_dev(input1, "id", "citizenNo");
    			input1.value = "checkedValue";
    			input1.checked = true;
    			add_location(input1, file$6, 2136, 8, 31138);
    			attr_dev(label1, "class", "form-check-label");
    			add_location(label1, file$6, 2135, 8, 31097);
    			attr_dev(div3, "class", "form-check");
    			add_location(div3, file$6, 2134, 7, 31064);
    			attr_dev(div4, "class", "col-md-6");
    			add_location(div4, file$6, 2127, 6, 30795);
    			attr_dev(div5, "class", "row");
    			add_location(div5, file$6, 2126, 5, 30771);
    			attr_dev(label2, "for", "");
    			add_location(label2, file$6, 2145, 9, 31415);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "txtName");
    			attr_dev(input2, "id", "name");
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "placeholder", "Full Name");
    			add_location(input2, file$6, 2146, 9, 31456);
    			attr_dev(small, "id", "helpId");
    			attr_dev(small, "class", "form-text text-muted");
    			add_location(small, file$6, 2147, 9, 31555);
    			attr_dev(div6, "class", "form-group");
    			add_location(div6, file$6, 2144, 7, 31381);
    			attr_dev(div7, "class", "col-12");
    			add_location(div7, file$6, 2143, 6, 31353);
    			attr_dev(div8, "class", "row mt-3");
    			add_location(div8, file$6, 2142, 5, 31324);
    			attr_dev(label3, "for", "");
    			add_location(label3, file$6, 2154, 9, 31773);
    			option0.__value = "MyKad";
    			option0.value = option0.__value;
    			add_location(option0, file$6, 2156, 8, 31895);
    			option1.__value = "Army Personnel";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 2157, 8, 31926);
    			option2.__value = "Police Personnel";
    			option2.value = option2.__value;
    			add_location(option2, file$6, 2158, 8, 31966);
    			option3.__value = "My PR";
    			option3.value = option3.__value;
    			add_location(option3, file$6, 2159, 8, 32008);
    			option4.__value = "Passport";
    			option4.value = option4.__value;
    			add_location(option4, file$6, 2160, 8, 32039);
    			attr_dev(select0, "class", "form-control");
    			attr_dev(select0, "name", "SelectID");
    			attr_dev(select0, "id", "typeofId");
    			add_location(select0, file$6, 2155, 9, 31827);
    			attr_dev(div9, "class", "form-group");
    			add_location(div9, file$6, 2153, 7, 31739);
    			attr_dev(div10, "class", "col-6");
    			add_location(div10, file$6, 2152, 6, 31712);
    			attr_dev(label4, "for", "");
    			add_location(label4, file$6, 2166, 8, 32177);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "txtIdNumber");
    			attr_dev(input3, "id", "idNumber");
    			attr_dev(input3, "class", "form-control");
    			attr_dev(input3, "placeholder", "Full Name");
    			add_location(input3, file$6, 2167, 8, 32217);
    			attr_dev(div11, "class", "form-group");
    			add_location(div11, file$6, 2165, 7, 32144);
    			attr_dev(div12, "class", "col-6");
    			add_location(div12, file$6, 2164, 6, 32117);
    			attr_dev(div13, "class", "row");
    			add_location(div13, file$6, 2151, 5, 31688);
    			attr_dev(label5, "for", "");
    			add_location(label5, file$6, 2174, 9, 32446);
    			option5.__value = "--Please Select--";
    			option5.value = option5.__value;
    			add_location(option5, file$6, 2176, 8, 32569);
    			option6.__value = "AFGHANISTAN";
    			option6.value = option6.__value;
    			add_location(option6, file$6, 2177, 8, 32612);
    			option7.__value = "MALAYSIA";
    			option7.value = option7.__value;
    			add_location(option7, file$6, 2178, 8, 32649);
    			attr_dev(select1, "class", "form-control");
    			attr_dev(select1, "name", "selectNationality");
    			attr_dev(select1, "id", "nationality");
    			add_location(select1, file$6, 2175, 9, 32489);
    			attr_dev(div14, "class", "form-group");
    			add_location(div14, file$6, 2173, 7, 32412);
    			attr_dev(div15, "class", "col-6");
    			add_location(div15, file$6, 2172, 6, 32385);
    			attr_dev(label6, "for", "");
    			add_location(label6, file$6, 2184, 8, 32787);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "form-control");
    			attr_dev(input4, "name", "txtDOB");
    			attr_dev(input4, "id", "DOB");
    			attr_dev(input4, "placeholder", "");
    			add_location(input4, file$6, 2185, 8, 32831);
    			attr_dev(div16, "class", "form-group");
    			add_location(div16, file$6, 2183, 7, 32754);
    			attr_dev(div17, "class", "col-6");
    			add_location(div17, file$6, 2182, 6, 32727);
    			attr_dev(div18, "class", "row");
    			add_location(div18, file$6, 2171, 5, 32361);
    			attr_dev(a, "name", "");
    			attr_dev(a, "id", "");
    			attr_dev(a, "class", "btn btn-primary");
    			attr_dev(a, "href", "#");
    			attr_dev(a, "role", "button");
    			add_location(a, file$6, 2192, 7, 33025);
    			attr_dev(div19, "class", "col-md-6");
    			add_location(div19, file$6, 2191, 6, 32995);
    			attr_dev(div20, "class", "row mt-3");
    			add_location(div20, file$6, 2190, 5, 32966);
    			attr_dev(div21, "class", "card-body");
    			add_location(div21, file$6, 2117, 4, 30497);
    			attr_dev(div22, "class", "card");
    			add_location(div22, file$6, 2116, 3, 30474);
    			attr_dev(div23, "class", "offset-2 col-8");
    			add_location(div23, file$6, 2115, 2, 30442);
    			attr_dev(div24, "class", "row");
    			add_location(div24, file$6, 2114, 1, 30422);
    			attr_dev(h2, "class", "card-text");
    			add_location(h2, file$6, 2203, 5, 33271);
    			attr_dev(label7, "for", "");
    			add_location(label7, file$6, 2208, 9, 33409);
    			option8.__value = "--Please Select--";
    			option8.value = option8.__value;
    			add_location(option8, file$6, 2210, 8, 33526);
    			option9.__value = "Primary";
    			option9.value = option9.__value;
    			add_location(option9, file$6, 2211, 8, 33569);
    			option10.__value = "Secondary";
    			option10.value = option10.__value;
    			add_location(option10, file$6, 2212, 8, 33602);
    			option11.__value = "Certificate";
    			option11.value = option11.__value;
    			add_location(option11, file$6, 2213, 8, 33637);
    			option12.__value = "Pre-University";
    			option12.value = option12.__value;
    			add_location(option12, file$6, 2214, 8, 33674);
    			option13.__value = "Diploma";
    			option13.value = option13.__value;
    			add_location(option13, file$6, 2215, 8, 33714);
    			option14.__value = "Degree";
    			option14.value = option14.__value;
    			add_location(option14, file$6, 2216, 8, 33747);
    			option15.__value = "Master";
    			option15.value = option15.__value;
    			add_location(option15, file$6, 2217, 8, 33779);
    			option16.__value = "Doctorate";
    			option16.value = option16.__value;
    			add_location(option16, file$6, 2218, 8, 33811);
    			option17.__value = "Professional";
    			option17.value = option17.__value;
    			add_location(option17, file$6, 2219, 8, 33846);
    			attr_dev(select2, "class", "form-control");
    			attr_dev(select2, "name", "eduLevel");
    			attr_dev(select2, "id", "eduLevel");
    			add_location(select2, file$6, 2209, 9, 33458);
    			attr_dev(div25, "class", "form-group");
    			add_location(div25, file$6, 2207, 7, 33375);
    			attr_dev(div26, "class", "col-12");
    			add_location(div26, file$6, 2206, 6, 33347);
    			attr_dev(div27, "class", "row");
    			add_location(div27, file$6, 2205, 5, 33323);
    			attr_dev(label8, "for", "");
    			add_location(label8, file$6, 2227, 9, 34024);
    			option18.__value = "--Please Select--";
    			option18.value = option18.__value;
    			add_location(option18, file$6, 2229, 8, 34138);
    			option19.__value = "Accountant";
    			option19.value = option19.__value;
    			add_location(option19, file$6, 2230, 8, 34181);
    			option20.__value = "Housewife/Househusband";
    			option20.value = option20.__value;
    			add_location(option20, file$6, 2231, 8, 34217);
    			attr_dev(select3, "class", "form-control");
    			attr_dev(select3, "name", "occupation");
    			attr_dev(select3, "id", "occupation");
    			add_location(select3, file$6, 2228, 9, 34066);
    			attr_dev(div28, "class", "form-group");
    			add_location(div28, file$6, 2226, 7, 33990);
    			attr_dev(div29, "class", "col-6");
    			add_location(div29, file$6, 2225, 6, 33963);
    			attr_dev(label9, "for", "");
    			add_location(label9, file$6, 2237, 8, 34369);
    			option21.__value = "--Please Select--";
    			option21.value = option21.__value;
    			add_location(option21, file$6, 2239, 10, 34483);
    			option22.__value = "Officer";
    			option22.value = option22.__value;
    			add_location(option22, file$6, 2240, 10, 34528);
    			option23.__value = "Manager";
    			option23.value = option23.__value;
    			add_location(option23, file$6, 2241, 10, 34563);
    			option24.__value = "Professional";
    			option24.value = option24.__value;
    			add_location(option24, file$6, 2242, 10, 34598);
    			attr_dev(select4, "class", "form-control");
    			attr_dev(select4, "name", "occupation");
    			attr_dev(select4, "id", "occupation");
    			add_location(select4, file$6, 2238, 8, 34409);
    			attr_dev(div30, "class", "form-group");
    			add_location(div30, file$6, 2236, 7, 34336);
    			attr_dev(div31, "class", "col-6");
    			add_location(div31, file$6, 2235, 6, 34309);
    			attr_dev(div32, "class", "row");
    			add_location(div32, file$6, 2224, 5, 33939);
    			add_location(p1, file$6, 2249, 7, 34743);
    			attr_dev(div33, "class", "col-6");
    			add_location(div33, file$6, 2248, 6, 34716);
    			attr_dev(div34, "class", "row");
    			add_location(div34, file$6, 2247, 5, 34692);
    			attr_dev(input5, "type", "radio");
    			attr_dev(input5, "class", "form-check-input");
    			attr_dev(input5, "name", "RadioBtnCitizen");
    			attr_dev(input5, "id", "citizenYes");
    			input5.value = "checkedValue";
    			input5.checked = true;
    			add_location(input5, file$6, 2256, 8, 34938);
    			attr_dev(label10, "class", "form-check-label");
    			add_location(label10, file$6, 2255, 8, 34897);
    			attr_dev(div35, "class", "form-check form-check-inline");
    			add_location(div35, file$6, 2254, 7, 34846);
    			attr_dev(input6, "type", "radio");
    			attr_dev(input6, "class", "form-check-input");
    			attr_dev(input6, "name", "RadioBtnCitizen");
    			attr_dev(input6, "id", "citizenNo");
    			input6.value = "checkedValue";
    			input6.checked = true;
    			add_location(input6, file$6, 2262, 8, 35195);
    			attr_dev(label11, "class", "form-check-label");
    			add_location(label11, file$6, 2261, 8, 35154);
    			attr_dev(div36, "class", "form-check form-check-inline");
    			add_location(div36, file$6, 2260, 7, 35103);
    			attr_dev(div37, "class", "col-md-6");
    			add_location(div37, file$6, 2253, 6, 34816);
    			attr_dev(div38, "class", "row");
    			add_location(div38, file$6, 2252, 5, 34792);
    			attr_dev(label12, "for", "");
    			add_location(label12, file$6, 2271, 9, 35472);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "class", "form-control");
    			attr_dev(input7, "name", "txtStaffID");
    			attr_dev(input7, "id", "staffID");
    			attr_dev(input7, "placeholder", "BMMB Staff ID");
    			add_location(input7, file$6, 2272, 9, 35518);
    			attr_dev(div39, "class", "form-group");
    			add_location(div39, file$6, 2270, 7, 35438);
    			attr_dev(div40, "class", "col-12");
    			add_location(div40, file$6, 2269, 6, 35410);
    			attr_dev(div41, "class", "row mt-3");
    			add_location(div41, file$6, 2268, 5, 35381);
    			attr_dev(label13, "for", "");
    			add_location(label13, file$6, 2280, 8, 35754);
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "class", "form-control");
    			attr_dev(input8, "name", "txtStaffSalary");
    			attr_dev(input8, "id", "staffBasicSalary");
    			attr_dev(input8, "placeholder", "Monthly Basic Salary");
    			add_location(input8, file$6, 2281, 8, 35806);
    			attr_dev(div42, "class", "form-group");
    			add_location(div42, file$6, 2279, 7, 35721);
    			attr_dev(div43, "class", "col-6");
    			add_location(div43, file$6, 2278, 6, 35694);
    			attr_dev(label14, "for", "");
    			add_location(label14, file$6, 2287, 8, 36031);
    			attr_dev(input9, "type", "text");
    			attr_dev(input9, "class", "form-control");
    			attr_dev(input9, "name", "txtStaffCommitment");
    			attr_dev(input9, "id", "StaffCommitment");
    			attr_dev(input9, "placeholder", "Monthly Other Salary");
    			add_location(input9, file$6, 2288, 8, 36083);
    			attr_dev(div44, "class", "form-group");
    			add_location(div44, file$6, 2286, 7, 35998);
    			attr_dev(div45, "class", "col-6");
    			add_location(div45, file$6, 2285, 6, 35971);
    			attr_dev(div46, "class", "row");
    			add_location(div46, file$6, 2277, 5, 35670);
    			attr_dev(label15, "for", "");
    			add_location(label15, file$6, 2296, 9, 36348);
    			attr_dev(input10, "type", "text");
    			attr_dev(input10, "class", "form-control");
    			attr_dev(input10, "name", "txtNoOfBankUsed");
    			attr_dev(input10, "id", "noOfBankUsed");
    			attr_dev(input10, "placeholder", "No. of Other Banks Used:");
    			add_location(input10, file$6, 2297, 9, 36404);
    			attr_dev(div47, "class", "form-group");
    			add_location(div47, file$6, 2295, 7, 36314);
    			attr_dev(div48, "class", "col-12");
    			add_location(div48, file$6, 2294, 6, 36286);
    			attr_dev(div49, "class", "row");
    			add_location(div49, file$6, 2293, 5, 36262);
    			attr_dev(label16, "for", "");
    			add_location(label16, file$6, 2305, 8, 36662);
    			attr_dev(input11, "type", "text");
    			attr_dev(input11, "class", "form-control");
    			attr_dev(input11, "name", "txtEmploymentType");
    			attr_dev(input11, "id", "employmentType");
    			attr_dev(input11, "placeholder", "Employment Type");
    			add_location(input11, file$6, 2306, 8, 36709);
    			attr_dev(div50, "class", "form-group");
    			add_location(div50, file$6, 2304, 7, 36629);
    			attr_dev(div51, "class", "col-6");
    			add_location(div51, file$6, 2303, 6, 36602);
    			attr_dev(label17, "for", "");
    			add_location(label17, file$6, 2312, 8, 36930);
    			attr_dev(input12, "type", "text");
    			attr_dev(input12, "class", "form-control");
    			attr_dev(input12, "name", "txtEmploymentSector");
    			attr_dev(input12, "id", "employmentSector");
    			attr_dev(input12, "placeholder", "Employment Sectory");
    			add_location(input12, file$6, 2313, 8, 36979);
    			attr_dev(div52, "class", "form-group");
    			add_location(div52, file$6, 2311, 7, 36897);
    			attr_dev(div53, "class", "col-6");
    			add_location(div53, file$6, 2310, 6, 36870);
    			attr_dev(div54, "class", "row");
    			add_location(div54, file$6, 2302, 5, 36578);
    			attr_dev(label18, "for", "");
    			add_location(label18, file$6, 2321, 8, 37242);
    			attr_dev(input13, "type", "text");
    			attr_dev(input13, "class", "form-control");
    			attr_dev(input13, "name", "txtSalary");
    			attr_dev(input13, "id", "basicSalary");
    			attr_dev(input13, "placeholder", "Monthly Basic Salary");
    			add_location(input13, file$6, 2322, 8, 37294);
    			attr_dev(div55, "class", "form-group");
    			add_location(div55, file$6, 2320, 7, 37209);
    			attr_dev(div56, "class", "col-6");
    			add_location(div56, file$6, 2319, 6, 37182);
    			attr_dev(label19, "for", "");
    			add_location(label19, file$6, 2328, 8, 37509);
    			attr_dev(input14, "type", "text");
    			attr_dev(input14, "class", "form-control");
    			attr_dev(input14, "name", "txtCommitment");
    			attr_dev(input14, "id", "Commitment");
    			attr_dev(input14, "placeholder", "Monthly Other Salary");
    			add_location(input14, file$6, 2329, 8, 37561);
    			attr_dev(div57, "class", "form-group");
    			add_location(div57, file$6, 2327, 7, 37476);
    			attr_dev(div58, "class", "col-6");
    			add_location(div58, file$6, 2326, 6, 37449);
    			attr_dev(div59, "class", "row");
    			add_location(div59, file$6, 2318, 5, 37158);
    			attr_dev(label20, "for", "");
    			add_location(label20, file$6, 2337, 8, 37814);
    			attr_dev(input15, "type", "text");
    			attr_dev(input15, "class", "form-control");
    			attr_dev(input15, "name", "txtEmployerName");
    			attr_dev(input15, "id", "employerName");
    			attr_dev(input15, "placeholder", "Employer Name");
    			add_location(input15, file$6, 2338, 8, 37859);
    			attr_dev(div60, "class", "form-group");
    			add_location(div60, file$6, 2336, 7, 37781);
    			attr_dev(div61, "class", "col-6");
    			add_location(div61, file$6, 2335, 6, 37754);
    			attr_dev(label21, "for", "");
    			add_location(label21, file$6, 2344, 8, 38074);
    			attr_dev(input16, "type", "text");
    			attr_dev(input16, "class", "form-control");
    			attr_dev(input16, "name", "txtnatureOfBusiness");
    			attr_dev(input16, "id", "natureOfBusiness");
    			attr_dev(input16, "placeholder", "Nature of Business");
    			add_location(input16, file$6, 2345, 8, 38124);
    			attr_dev(div62, "class", "form-group");
    			add_location(div62, file$6, 2343, 7, 38041);
    			attr_dev(div63, "class", "col-6");
    			add_location(div63, file$6, 2342, 6, 38014);
    			attr_dev(div64, "class", "row");
    			add_location(div64, file$6, 2334, 5, 37730);
    			attr_dev(label22, "for", "");
    			add_location(label22, file$6, 2353, 9, 38389);
    			attr_dev(input17, "type", "text");
    			attr_dev(input17, "class", "form-control");
    			attr_dev(input17, "name", "txtNoOfBankUsed");
    			attr_dev(input17, "id", "noOfBankUsed");
    			attr_dev(input17, "placeholder", "No. of Other Banks Used:");
    			add_location(input17, file$6, 2354, 9, 38445);
    			attr_dev(div65, "class", "form-group");
    			add_location(div65, file$6, 2352, 7, 38355);
    			attr_dev(div66, "class", "col-12");
    			add_location(div66, file$6, 2351, 6, 38327);
    			attr_dev(div67, "class", "row");
    			add_location(div67, file$6, 2350, 5, 38303);
    			attr_dev(div68, "class", "card-body");
    			add_location(div68, file$6, 2202, 4, 33242);
    			attr_dev(div69, "class", "card");
    			add_location(div69, file$6, 2201, 3, 33219);
    			attr_dev(div70, "class", "offset-2 col-8");
    			add_location(div70, file$6, 2200, 2, 33187);
    			attr_dev(div71, "class", "row mt-3");
    			add_location(div71, file$6, 2199, 1, 33162);
    			attr_dev(div72, "class", "container-fluid mt-3");
    			add_location(div72, file$6, 2113, 0, 30386);
    			add_location(h11, file$6, 2371, 4, 38739);
    			add_location(br0, file$6, 2780, 4, 49906);
    			add_location(br1, file$6, 2781, 4, 49917);
    			add_location(form, file$6, 2370, 3, 38728);
    			attr_dev(div73, "class", "col");
    			add_location(div73, file$6, 2369, 2, 38707);
    			attr_dev(div74, "class", "row");
    			add_location(div74, file$6, 2368, 1, 38687);
    			attr_dev(div75, "class", "container");
    			add_location(div75, file$6, 2367, 0, 38662);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div72, anchor);
    			append_dev(div72, div24);
    			append_dev(div24, div23);
    			append_dev(div23, div22);
    			append_dev(div22, div21);
    			append_dev(div21, h10);
    			append_dev(div21, t2);
    			append_dev(div21, h4);
    			append_dev(div21, t4);
    			append_dev(div21, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div21, t6);
    			append_dev(div21, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, label0);
    			append_dev(label0, input0);
    			append_dev(label0, t7);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, label1);
    			append_dev(label1, input1);
    			append_dev(label1, t9);
    			append_dev(div21, t10);
    			append_dev(div21, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, label2);
    			append_dev(div6, t12);
    			append_dev(div6, input2);
    			append_dev(div6, t13);
    			append_dev(div6, small);
    			append_dev(div21, t15);
    			append_dev(div21, div13);
    			append_dev(div13, div10);
    			append_dev(div10, div9);
    			append_dev(div9, label3);
    			append_dev(div9, t17);
    			append_dev(div9, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			append_dev(select0, option4);
    			append_dev(div13, t23);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, label4);
    			append_dev(div11, t25);
    			append_dev(div11, input3);
    			append_dev(div21, t26);
    			append_dev(div21, div18);
    			append_dev(div18, div15);
    			append_dev(div15, div14);
    			append_dev(div14, label5);
    			append_dev(div14, t28);
    			append_dev(div14, select1);
    			append_dev(select1, option5);
    			append_dev(select1, option6);
    			append_dev(select1, option7);
    			append_dev(div18, t32);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div16, label6);
    			append_dev(div16, t34);
    			append_dev(div16, input4);
    			append_dev(div21, t35);
    			append_dev(div21, div20);
    			append_dev(div20, div19);
    			append_dev(div19, a);
    			append_dev(div72, t37);
    			append_dev(div72, div71);
    			append_dev(div71, div70);
    			append_dev(div70, div69);
    			append_dev(div69, div68);
    			append_dev(div68, h2);
    			append_dev(div68, t39);
    			append_dev(div68, div27);
    			append_dev(div27, div26);
    			append_dev(div26, div25);
    			append_dev(div25, label7);
    			append_dev(div25, t41);
    			append_dev(div25, select2);
    			append_dev(select2, option8);
    			append_dev(select2, option9);
    			append_dev(select2, option10);
    			append_dev(select2, option11);
    			append_dev(select2, option12);
    			append_dev(select2, option13);
    			append_dev(select2, option14);
    			append_dev(select2, option15);
    			append_dev(select2, option16);
    			append_dev(select2, option17);
    			append_dev(div68, t52);
    			append_dev(div68, div32);
    			append_dev(div32, div29);
    			append_dev(div29, div28);
    			append_dev(div28, label8);
    			append_dev(div28, t54);
    			append_dev(div28, select3);
    			append_dev(select3, option18);
    			append_dev(select3, option19);
    			append_dev(select3, option20);
    			append_dev(div32, t58);
    			append_dev(div32, div31);
    			append_dev(div31, div30);
    			append_dev(div30, label9);
    			append_dev(div30, t60);
    			append_dev(div30, select4);
    			append_dev(select4, option21);
    			append_dev(select4, option22);
    			append_dev(select4, option23);
    			append_dev(select4, option24);
    			append_dev(div68, t65);
    			append_dev(div68, div34);
    			append_dev(div34, div33);
    			append_dev(div33, p1);
    			append_dev(div68, t67);
    			append_dev(div68, div38);
    			append_dev(div38, div37);
    			append_dev(div37, div35);
    			append_dev(div35, label10);
    			append_dev(label10, input5);
    			append_dev(label10, t68);
    			append_dev(div37, t69);
    			append_dev(div37, div36);
    			append_dev(div36, label11);
    			append_dev(label11, input6);
    			append_dev(label11, t70);
    			append_dev(div68, t71);
    			append_dev(div68, div41);
    			append_dev(div41, div40);
    			append_dev(div40, div39);
    			append_dev(div39, label12);
    			append_dev(div39, t73);
    			append_dev(div39, input7);
    			append_dev(div68, t74);
    			append_dev(div68, div46);
    			append_dev(div46, div43);
    			append_dev(div43, div42);
    			append_dev(div42, label13);
    			append_dev(div42, t76);
    			append_dev(div42, input8);
    			append_dev(div46, t77);
    			append_dev(div46, div45);
    			append_dev(div45, div44);
    			append_dev(div44, label14);
    			append_dev(div44, t79);
    			append_dev(div44, input9);
    			append_dev(div68, t80);
    			append_dev(div68, div49);
    			append_dev(div49, div48);
    			append_dev(div48, div47);
    			append_dev(div47, label15);
    			append_dev(div47, t82);
    			append_dev(div47, input10);
    			append_dev(div68, t83);
    			append_dev(div68, div54);
    			append_dev(div54, div51);
    			append_dev(div51, div50);
    			append_dev(div50, label16);
    			append_dev(div50, t85);
    			append_dev(div50, input11);
    			append_dev(div54, t86);
    			append_dev(div54, div53);
    			append_dev(div53, div52);
    			append_dev(div52, label17);
    			append_dev(div52, t88);
    			append_dev(div52, input12);
    			append_dev(div68, t89);
    			append_dev(div68, div59);
    			append_dev(div59, div56);
    			append_dev(div56, div55);
    			append_dev(div55, label18);
    			append_dev(div55, t91);
    			append_dev(div55, input13);
    			append_dev(div59, t92);
    			append_dev(div59, div58);
    			append_dev(div58, div57);
    			append_dev(div57, label19);
    			append_dev(div57, t94);
    			append_dev(div57, input14);
    			append_dev(div68, t95);
    			append_dev(div68, div64);
    			append_dev(div64, div61);
    			append_dev(div61, div60);
    			append_dev(div60, label20);
    			append_dev(div60, t97);
    			append_dev(div60, input15);
    			append_dev(div64, t98);
    			append_dev(div64, div63);
    			append_dev(div63, div62);
    			append_dev(div62, label21);
    			append_dev(div62, t100);
    			append_dev(div62, input16);
    			append_dev(div68, t101);
    			append_dev(div68, div67);
    			append_dev(div67, div66);
    			append_dev(div66, div65);
    			append_dev(div65, label22);
    			append_dev(div65, t103);
    			append_dev(div65, input17);
    			insert_dev(target, t104, anchor);
    			insert_dev(target, div75, anchor);
    			append_dev(div75, div74);
    			append_dev(div74, div73);
    			append_dev(div73, form);
    			append_dev(form, h11);
    			append_dev(form, t106);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(form, null);
    			}

    			append_dev(form, t107);
    			if (if_block1) if_block1.m(form, null);
    			append_dev(form, t108);
    			if (if_block2) if_block2.m(form, null);
    			append_dev(form, t109);
    			append_dev(form, br0);
    			append_dev(form, t110);
    			append_dev(form, br1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(form, t107);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (/*step*/ ctx[2] >= 2) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(form, t108);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*step*/ ctx[2] < /*last_step*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					if_block2.m(form, t109);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div72);
    			if (detaching) detach_dev(t104);
    			if (detaching) detach_dev(div75);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let output = {
    		full_name: "",
    		type_of_id: "mykad",
    		id_number: "",
    		passport_number: "",
    		nationality: "malaysia",
    		pr_status: "",
    		pr_id_number: "",
    		pr_country: "malaysia",
    		date_of_birth: "",
    		us_related: "",
    		educations_detail: "none",
    		occupation: "other outside labour force",
    		job_title: "officer",
    		bmmb_staff: "no",
    		bmmb_staff_id: "",
    		employment_type: "private employee",
    		employment_sector: "information & communication",
    		monthly_basic_salary: "",
    		monthly_other_salary: "",
    		employer_name: "",
    		nature_of_business: "",
    		no_of_other_banks_used: "0",
    		bmmb_high_net_worth: "no",
    		pep_related: "no",
    		local_address: "",
    		local_postal_code: "",
    		local_city: "",
    		local_state_code: "",
    		local_coutry: "",
    		foreign_address: "",
    		foreign_postal_code: "",
    		foreign_city: "",
    		foreign_state_code: "",
    		foreign_coutry: "",
    		mail_same_local: "no",
    		mailing_address: "",
    		mailing_postal_code: "",
    		mailing_city: "",
    		mailing_state_code: "",
    		mailing_coutry: "",
    		property_ownership: "owned",
    		mobile_number: "",
    		office_number: "",
    		email_address: "",
    		race: "malay",
    		gender: "male",
    		maritial_status: "single",
    		spouse_name: "",
    		no_of_dependents: "",
    		contact_person_name: "",
    		contact_relationship: "other",
    		contact_mobile_number: "",
    		bmmb_account_type: "saving account (sa)",
    		purpose_of_account: "payroll/saving",
    		product_to_open: "sa muss",
    		prefered_branch: "jalan melaka"
    	};

    	let step = 1;
    	let last_step = 7;

    	let id_type_options = [
    		{ label: "Mykad" },
    		{ label: "Army Personnel ID" },
    		{ label: "Police Personnel ID" },
    		{ label: "MyPR" },
    		{ label: "Passport" }
    	];

    	let nationality_options = [
    		{ label: "AFGHANISTAN" },
    		{ label: "ALBANIA" },
    		{ label: "ALGERIA" },
    		{ label: "AMERICA SAMOA" },
    		{ label: "ANDORRA" },
    		{ label: "ANGOLA" },
    		{ label: "ANGUILLA" },
    		{ label: "ANTARCTICA" },
    		{ label: "ANTIGUA" },
    		{ label: "ARGENTINA" },
    		{ label: "ARMENIA" },
    		{ label: "ARUBA" },
    		{ label: "AUSTRALIA" },
    		{ label: "AUSTRIA" },
    		{ label: "AZERBAIJAN" },
    		{ label: "BAHAMAS" },
    		{ label: "BAHRAIN" },
    		{ label: "BANGLADESH" },
    		{ label: "BARBADOS" },
    		{ label: "BELARUS" },
    		{ label: "BELGIUM" },
    		{ label: "BELIZE" },
    		{ label: "BENIN" },
    		{ label: "BERMUDA" },
    		{ label: "BHUTAN" },
    		{ label: "BOLIVIA" },
    		{ label: "BOTSWANA" },
    		{ label: "BOUVET ISLAND" },
    		{ label: "BRAZIL" },
    		{ label: "BRITISH INDIAN OCEAN TERRITORY" },
    		{ label: "BRITISH VIRGIN ISLANDS" },
    		{ label: "BRUNEI" },
    		{ label: "BULGARIA" },
    		{ label: "BURKINA FASO" },
    		{ label: "BURMA" },
    		{ label: "BURUNDI" },
    		{ label: "CAMBODIA" },
    		{ label: "CAMEROON, UNITED REPUBLIC" },
    		{ label: "CANADA" },
    		{ label: "CANTON AND ENDERBURY ISLAN" },
    		{ label: "CAPE VERDE" },
    		{ label: "CAYMAN ISLANDS" },
    		{ label: "CENTRAL AFRICAN REPUBLIC" },
    		{ label: "CHAD" },
    		{ label: "CHILE" },
    		{ label: "CHINA" },
    		{ label: "CHRISTMAS ISLANDS" },
    		{ label: "COCOS(KEELING)ISLANDS" },
    		{ label: "COLOMBIA" },
    		{ label: "COMOROS" },
    		{ label: "CONGO" },
    		{ label: "COOK ISLANDS" },
    		{ label: "COSTA RICA" },
    		{ label: "COTE D'IVOIRE (IVORY COAST)" },
    		{ label: "CROATIA" },
    		{ label: "CUBA" },
    		{ label: "CYPRUS" },
    		{ label: "CZECHOSLOVAKIA" },
    		{ label: "DENMARK" },
    		{ label: "DJIBOUTI" },
    		{ label: "DOMINICA" },
    		{ label: "DOMINICAN REPUBLIC" },
    		{ label: "DRONNING MAUD LAND" },
    		{ label: "EAST TIMOR" },
    		{ label: "ECUADOR" },
    		{ label: "EGYPT" },
    		{ label: "EL SALVADOR" },
    		{ label: "EQUATORIAL GUINEA" },
    		{ label: "ESTONIA" },
    		{ label: "ETHIOPIA" },
    		{ label: "FAEROE ISLANDS" },
    		{ label: "FALKLAND ISLANDS (MALVINAS)" },
    		{ label: "FIJI" },
    		{ label: "FINLAND" },
    		{ label: "FRANCE" },
    		{ label: "FRENCH GUIANA" },
    		{ label: "FRENCH POLYNESIA" },
    		{ label: "FRENCH SOUTHERN TERRITORIES" },
    		{ label: "GABON" },
    		{ label: "GAMBIA" },
    		{ label: "GEORGIA" },
    		{ label: "GERMAN DEMOCRATIC REPUBLIC" },
    		{ label: "GERMANY" },
    		{ label: "GHANA" },
    		{ label: "GIBRALTAR" },
    		{ label: "GREECE" },
    		{ label: "GREENLAND" },
    		{ label: "GRENADA" },
    		{ label: "GUADELOUPE" },
    		{ label: "GUAM" },
    		{ label: "GUATEMALA" },
    		{ label: "GUERNSEY, C.I." },
    		{ label: "GUINEA" },
    		{ label: "GUINEA BISSAU" },
    		{ label: "GUYANA" },
    		{ label: "HAITI" },
    		{ label: "HEARD AND MCDONALD ISLANDS" },
    		{ label: "HONDURAS" },
    		{ label: "HONG KONG" },
    		{ label: "HUNGARY" },
    		{ label: "ICELAND" },
    		{ label: "INDIA" },
    		{ label: "INDONESIA" },
    		{ label: "IRAN" },
    		{ label: "IRAQ" },
    		{ label: "IRELAND" },
    		{ label: "ISLE OF MAN" },
    		{ label: "ISRAEL" },
    		{ label: "ITALY" },
    		{ label: "JAMAICA" },
    		{ label: "JAPAN" },
    		{ label: "JERSEY, C.I." },
    		{ label: "JOHNSTON ISLAND" },
    		{ label: "JORDAN" },
    		{ label: "KAZAKHSTAN" },
    		{ label: "KENYA" },
    		{ label: "KIRIBATI" },
    		{ label: "KOREA" },
    		{ label: "KOREA DEMOCRATIC PEOPLES REP" },
    		{ label: "KUWAIT" },
    		{ label: "KYRGYZSTAN" },
    		{ label: "LAO PEOPLE'S DEMOCRATIC REP" },
    		{ label: "LATVIA" },
    		{ label: "LEBANON" },
    		{ label: "LESOTHO" },
    		{ label: "LIBERIA" },
    		{ label: "LIBYAN ARAB JAMAHIRIYA" },
    		{ label: "LICHTENSTEIN" },
    		{ label: "LITHUANIA" },
    		{ label: "LUXEMBOURG" },
    		{ label: "MACAU" },
    		{ label: "MADAGASCAR" },
    		{ label: "MALAWI" },
    		{ label: "MALAYSIA" },
    		{ label: "MALDIVES" },
    		{ label: "MALI" },
    		{ label: "MALTA" },
    		{ label: "MARSHALL ISLANDS" },
    		{ label: "MARTINIQUE" },
    		{ label: "MAURITANIA" },
    		{ label: "MAURITIUS" },
    		{ label: "MEXICO" },
    		{ label: "MICRONESIA" },
    		{ label: "MIDWAY ISLANDS" },
    		{ label: "MOLDOVA, REPUBLIC OF" },
    		{ label: "MONACO" },
    		{ label: "MONGOLIA" },
    		{ label: "MONTSERRAT" },
    		{ label: "MOROCCO" },
    		{ label: "MOZAMBIQUE" },
    		{ label: "MYANMAR" },
    		{ label: "NAMIBIA" },
    		{ label: "NAURU" },
    		{ label: "NEPAL" },
    		{ label: "NETHERLANDS" },
    		{ label: "NETHERLANDS ANTILLES" },
    		{ label: "NEUTRAL ZONE(BET.S.ARABIA)" },
    		{ label: "NEW CALEDONIA" },
    		{ label: "NEW ZEALAND" },
    		{ label: "NICARAGUA" },
    		{ label: "NIGER" },
    		{ label: "NIGERIA" },
    		{ label: "NIUE" },
    		{ label: "NORFOLK ISLAND" },
    		{ label: "NORTHERN MARIANA ISLANDS" },
    		{ label: "NORWAY" },
    		{ label: "OMAN" },
    		{ label: "OTHERS" },
    		{ label: "PACIFIC ISLANDS" },
    		{ label: "PACIFIC ISLANDS (TRUST TER)" },
    		{ label: "PAKISTAN" },
    		{ label: "PALAU" },
    		{ label: "PANAMA" },
    		{ label: "PAPUA NEW GUINEA" },
    		{ label: "PARAGUAY" },
    		{ label: "PERU" },
    		{ label: "PHILIPPINES" },
    		{ label: "PITCAIRN" },
    		{ label: "POLAND" },
    		{ label: "PORTUGAL" },
    		{ label: "PUERTO RICO" },
    		{ label: "QATAR" },
    		{ label: "REUNION" },
    		{ label: "ROMANIA" },
    		{ label: "RUSSIA" },
    		{ label: "RWANDA" },
    		{ label: "SAINT LUCIA" },
    		{ label: "SAINT VINCENT AND THE GRENE" },
    		{ label: "SAMOA" },
    		{ label: "SAN MARINO" },
    		{ label: "SAO TOME AND PRINCIPE" },
    		{ label: "SAUDI ARABIA" },
    		{ label: "SENEGAL" },
    		{ label: "SEYCHELLES" },
    		{ label: "SIERRA LEONE" },
    		{ label: "SINGAPORE" },
    		{ label: "SLOVENIA" },
    		{ label: "SOLOMON ISLANDS" },
    		{ label: "SOMALIA" },
    		{ label: "SOUTH AFRICA" },
    		{ label: "SPAIN" },
    		{ label: "SRI LANKA" },
    		{ label: "ST.HELENA" },
    		{ label: "ST.KITTS-NEVIS-ANGUILLA" },
    		{ label: "ST.PIERRE AND MIQUELON" },
    		{ label: "SUDAN" },
    		{ label: "SURINAME" },
    		{ label: "SVALBARD AND JAN MAYEN ISL" },
    		{ label: "SWAZILAND" },
    		{ label: "SWEDEN" },
    		{ label: "SWITZERLAND" },
    		{ label: "SYRIAN ARAB REPUBLIC" },
    		{ label: "TAIWAN" },
    		{ label: "TAJIKISTAN" },
    		{ label: "TANZANIA, UNITED REPUBLIC" },
    		{ label: "THAILAND" },
    		{ label: "TOGO" },
    		{ label: "TOKELAU" },
    		{ label: "TONGA" },
    		{ label: "TRINIDAD AND TOBAGO" },
    		{ label: "TUNISIA" },
    		{ label: "TURKEY" },
    		{ label: "TURKMENISTAN" },
    		{ label: "TURKS AND CAICOS ISLANDS" },
    		{ label: "TUVALU" },
    		{ label: "UGANDA" },
    		{ label: "UKRAINE" },
    		{ label: "UNITED ARAB EMIRATES" },
    		{ label: "UNITED KINGDOM" },
    		{ label: "UNITED STATES" },
    		{ label: "UNITED STATES MINOR OUTLYING" },
    		{ label: "UPPER VOLTA" },
    		{ label: "URUGUAY" },
    		{ label: "USSR" },
    		{ label: "UZBEKISTAN" },
    		{ label: "VANUATU" },
    		{ label: "VATICAN CITY STATE (HOLY S)" },
    		{ label: "VENEZUELA" },
    		{ label: "VIETNAM" },
    		{ label: "VIRGIN ISLANDS UNITED STATES" },
    		{ label: "WAKE ISLAND" },
    		{ label: "WALLIS AND FUTUNA ISLANDS" },
    		{ label: "WESTERN SAHARA" },
    		{ label: "YEMEN DEMOCRATIC" },
    		{ label: "YEMEN, REPUBLIC OF" },
    		{ label: "YUGOSLAVIA" },
    		{ label: "ZAIRE" },
    		{ label: "ZAMBIA" },
    		{ label: "ZIMBABWE" }
    	];

    	let pr_status_options = [{ label: "No PR" }, { label: "Foreign PR" }];

    	let educations_detail_options = [
    		{ label: "NONE" },
    		{ label: "PRIMARY" },
    		{ label: "SECONDARY" },
    		{ label: "CERTIFICATE" },
    		{ label: "PRE-UNIVERSITY" },
    		{ label: "DIPLOMA" },
    		{ label: "DEGREE" },
    		{ label: "MASTER" },
    		{ label: "DOCTORATE" },
    		{ label: "PROFESSIONAL" }
    	];

    	let occupation_options = [
    		{ label: "Other Outside Labour Force" },
    		{ label: "Retiree" },
    		{ label: "Student" },
    		{ label: "Housewife/Househusband" },
    		{ label: "Armed Forces Occupations" },
    		{ label: "Elementary Occupations" },
    		{
    			label: "Plant and Machine Operators, and Assemblers"
    		},
    		{
    			label: "Craft and Related Trades Workers"
    		},
    		{
    			label: "Skilled Agricultural, Forestry, Livestock and Fishery Workers"
    		},
    		{ label: "Service and Sales Workers" },
    		{ label: "Clerical Support Workers" },
    		{
    			label: "Regulatory Government Associate Professionals"
    		},
    		{
    			label: "Social, Cultural and Related Associate Professionals"
    		},
    		{
    			label: "Information and Communications Technicians"
    		},
    		{ label: "Legal Associate Professionals" },
    		{
    			label: "Business and Administrations Associate Professionals"
    		},
    		{ label: "Health Associate Professionals" },
    		{
    			label: "Science and Engineering Associate Professionals"
    		},
    		{
    			label: "Regulatory Government Professionals"
    		},
    		{
    			label: "Social and Cultural Professionals"
    		},
    		{
    			label: "Hospitality and Related Services Professionals"
    		},
    		{ label: "Legal Professionals n.e.c." },
    		{ label: "Judges" },
    		{ label: "Lawyers" },
    		{
    			label: "Information and Communications Technology Professionals"
    		},
    		{
    			label: "Sales, Marketing and Public Relations Professionals"
    		},
    		{ label: "Administration Professionals" },
    		{ label: "Financial Analysts" },
    		{
    			label: "Financial and Investment Advisers"
    		},
    		{ label: "Accountants" },
    		{ label: "Teaching Professionals" },
    		{
    			label: "Health Professionals Not Elsewhere Classified"
    		},
    		{
    			label: "Optometrists and Ophthalmic Opticians"
    		},
    		{ label: "Pharmacists" },
    		{ label: "Dentists" },
    		{
    			label: "Nursing and Midwifery Professionals"
    		},
    		{ label: "Medical Doctors" },
    		{
    			label: "Science and Engineering Professionals"
    		},
    		{ label: "Services Managers" },
    		{
    			label: "Information and Communications Technology Managers"
    		},
    		{
    			label: "Hospitality, Retail and Other Services Managers"
    		},
    		{
    			label: "Production and Manufacturing Managers"
    		},
    		{
    			label: "Administrative and Commercial Managers"
    		},
    		{
    			label: "Managing Directors and Chief Executives"
    		},
    		{
    			label: "Legislators and Senior Officials"
    		}
    	];

    	let job_title_options = [
    		{ label: "UNIFORM PERSONNEL" },
    		{ label: "SUPERVISOR" },
    		{ label: "SEMI SKILLED WORKERS" },
    		{ label: "SENIOR MANAGEMENT" },
    		{ label: "SENIOR OFFICER" },
    		{ label: "SELF EMPLOYED" },
    		{ label: "PROFESSIONAL" },
    		{ label: "OPERATOR (FACTORY)" },
    		{ label: "OTHER PROFESSION" },
    		{ label: "OFFICER" },
    		{ label: "NOT APPLICABLE" },
    		{ label: "NON-FIXED INCOME EARNER" },
    		{ label: "NON-CLERICAL" },
    		{ label: "MANAGERIAL" },
    		{ label: "MANAGER" },
    		{ label: "MINISTER" },
    		{ label: "HOUSEWIFE" },
    		{ label: "GENERAL MANAGER" },
    		{ label: "GENERAL WORKER" },
    		{ label: "FOREIGN WORKER" },
    		{ label: "EXECUTIVE" },
    		{ label: "DIRECTOR" },
    		{ label: "CONSULTANT" },
    		{ label: "CLERICAL" },
    		{ label: "CHAIRMAN" },
    		{ label: "ASSISTANT MANAGER" }
    	];

    	let bmmb_staff_options = [{ label: "No" }, { label: "Yes" }];

    	let employment_type_options = [
    		{ label: "Employer" },
    		{ label: "Self employed" },
    		{ label: "Private Employee" },
    		{ label: "Government Employee" },
    		{ label: "Outside Labour Force" }
    	];

    	let employment_sector_options = [
    		{ label: "Agriculture, Forestry & Fishing" },
    		{ label: "Information & Communication" },
    		{
    			label: "Human Health & Social Work Activities"
    		},
    		{ label: "Other Service Activities" },
    		{
    			label: "Professional, Scientific & Technical Activities"
    		},
    		{
    			label: "Administrative & Support Service Activities"
    		},
    		{ label: "Education" },
    		{
    			label: "Public Admin & Defence,Compulsory Social Security"
    		},
    		{ label: "Not Applicable" }
    	];

    	let nature_of_business_options = [
    		{ label: "OTHERS" },
    		{ label: "MANUFACTURING" },
    		{ label: "TEXTILES" },
    		{ label: "TRAVEL/TRANSPORTATION" },
    		{ label: "TELECOMMUNICATIONS/NETWORKING" },
    		{ label: "SOCIAL SERVICES" },
    		{ label: "SERVICES" },
    		{ label: "REAL ESTATE" },
    		{ label: "PHARMACEUTICALS" },
    		{ label: "GEOLOGY" },
    		{ label: "NON-PROFIT ORGANIZATION" },
    		{ label: "MEDICAL/HEALTH SERVICES" },
    		{
    			label: "MEDIA/PUBLISHING/ENTERTAINMENT/ARTS"
    		},
    		{ label: "JOURNALIST/EDITOR" },
    		{ label: "INVESTMENT" },
    		{ label: "HUMAN RESOURCES" },
    		{ label: "HOTEL/FOOD" },
    		{ label: "RECREATION/HOSPITALITY/SPORTS" },
    		{
    			label: "GOVERNMENT/MILITARY/PUBLIC SERVICE"
    		},
    		{ label: "FREIGHT/SHIPPING" },
    		{ label: "FINANCE/BANKING/INSURANCE" },
    		{ label: "ENGINEERING" },
    		{ label: "ENERGY/MINING" },
    		{
    			label: "EDUCATION(INCLUDES STUDENTS)/TRAINING"
    		},
    		{ label: "CUSTOMER SERVICE" },
    		{ label: "CREATIVE/GRAPHICS" },
    		{ label: "CONSTRUCTION" },
    		{ label: "COMPUTERS/ELECTRONICS" },
    		{ label: "BUYING RETAIL" },
    		{ label: "AVIATION" },
    		{
    			label: "AUTOMOTIVE/MANUFACTURING.PRODUCTION"
    		},
    		{ label: "ARCHITECTURE" },
    		{
    			label: "AGRICULTURAL/CHEMICALS/FOREST PRODUCTS"
    		},
    		{ label: "AEROSPACE" },
    		{ label: "ADVERTISING/MARKETING/PR" },
    		{ label: "ACTUARIAL/STATISTIC" },
    		{ label: "ACCOUNTING" }
    	];

    	let bmmb_high_net_worth_options = [{ label: "Yes" }, { label: "No" }];
    	let pep_related_options = [{ label: "Yes" }, { label: "No" }];

    	let property_ownership_options = [
    		{ label: "UNKNOWN" },
    		{ label: "RENTED" },
    		{ label: "HOSTEL" },
    		{ label: "RELATIVES" },
    		{ label: "QUARTERS" },
    		{ label: "PARENT" },
    		{ label: "OWNED" }
    	];

    	let race_options = [
    		{ label: "MALAY" },
    		{ label: "SABAH" },
    		{ label: "SARAWAK" },
    		{ label: "CHINESE" },
    		{ label: "INDIAN" },
    		{ label: "OTHERS" }
    	];

    	let gender_options = [{ label: "Male" }, { label: "Female" }];

    	let maritial_status_options = [
    		{ label: "UNKNOWN" },
    		{ label: "SINGLE" },
    		{ label: "Primary" },
    		{ label: "MARRIED" },
    		{ label: "DIVORCED" },
    		{ label: "WIDOWED" }
    	];

    	let contact_relationship_options = [
    		{ label: "Father" },
    		{ label: "Mother" },
    		{ label: "Sibling" },
    		{ label: "Other" }
    	];

    	let bmmb_account_type_options = [
    		{ label: "Saving Account (SA)" },
    		{ label: "Current Account (CA)" },
    		{ label: "Fixed Term Account (FA)" }
    	];

    	let purpose_of_account_options = [
    		{ label: "Payroll/Saving" },
    		{ label: "Saving & Payment" },
    		{ label: "Financing Disbursement" },
    		{
    			label: "Receive Payment from 3rd Parties"
    		},
    		{ label: "Deposit Campaign" }
    	];

    	let product_to_open_options = [{ label: "SA MuSS" }, { label: "SA One Reach" }];

    	let prefered_branch_options = [
    		{ label: "(ALOR SETAR) SOUQ AL BUKHARY" },
    		{ label: "ALAM DAMAI" },
    		{ label: "ALOR SETAR" },
    		{ label: "AMPANG POINT" },
    		{ label: "BANDAR BARU BANGI" },
    		{ label: "BATU CAVES" },
    		{ label: "BATU PAHAT" },
    		{ label: "BAYAN BARU" },
    		{ label: "BINTULU" },
    		{
    			label: "EAST COAST SALES HUB (KOTA BHARU)"
    		},
    		{ label: "GEMAS" },
    		{ label: "GLENMARIE" },
    		{ label: "GUA MUSANG" },
    		{ label: "IPOH" },
    		{ label: "JALAN IPOH" },
    		{ label: "JALAN MELAKA" },
    		{ label: "JALAN SULTAN YAHYA PETRA" },
    		{ label: "JALAN TUANKU ABD RAHMAN" },
    		{ label: "JELI" },
    		{ label: "JOHOR BAHRU" },
    		{ label: "JOHOR JAYA" },
    		{ label: "KAJANG" },
    		{ label: "KAMPUNG RAJA" },
    		{ label: "KANGAR" },
    		{ label: "KELANG" },
    		{ label: "KEMAMAN" },
    		{ label: "KLUANG" },
    		{ label: "KOK LANAS" },
    		{ label: "KOTA BHARU" },
    		{ label: "KOTA KINABALU" },
    		{ label: "KOTA TINGGI" },
    		{ label: "KUALA LUMPUR SALES HUB" },
    		{ label: "KUALA TERENGGANU" },
    		{ label: "KUANTAN" },
    		{ label: "KUCHING" },
    		{ label: "KULAI" },
    		{ label: "KULIM" },
    		{ label: "LABUAN" },
    		{ label: "LAMAN SERI" },
    		{ label: "LEBUH PANTAI" },
    		{ label: "MELAKA" },
    		{ label: "MENTAKAB" },
    		{ label: "MIRI" },
    		{ label: "MUAR" },
    		{ label: "NORTHERN SALES HUB" },
    		{ label: "PARIT BUNTAR" },
    		{ label: "PEKAN" },
    		{ label: "PETALING JAYA" },
    		{ label: "PKNS, SHAH ALAM" },
    		{ label: "PORT DICKSON" },
    		{ label: "PUNCAK ALAM" },
    		{ label: "PUTRAJAYA" },
    		{ label: "RAWANG" },
    		{ label: "SABAH SALES HUB" },
    		{ label: "SANDAKAN" },
    		{ label: "SARAWAK SALES HUB" },
    		{ label: "SEBERANG JAYA" },
    		{ label: "SEGAMAT" },
    		{ label: "SELANGOR SALES HUB (PKNS)" },
    		{ label: "SEREMBAN" },
    		{ label: "SERI MANJUNG" },
    		{ label: "SOUTHERN SALES HUB (JOHOR)" },
    		{ label: "SUBANG JAYA" },
    		{ label: "SUNGAI BESI" },
    		{ label: "SUNGAI PETANI" },
    		{ label: "TAIPING" },
    		{ label: "TAMAN CHENG BARU" },
    		{ label: "TAMAN MELAWATI" },
    		{ label: "TAMAN UNIVERSITI" },
    		{ label: "TANAH MERAH" },
    		{ label: "TAWAU" },
    		{ label: "TEMERLOH" },
    		{ label: "UNIVERSITY ISLAM ANTARABANGSA" },
    		{ label: "UTHM" }
    	];

    	let form_display = {
    		full_name: { display: false, disable: false },
    		type_of_id: { display: false, disable: false },
    		id_number: { display: false, disable: false },
    		passport_number: { display: false, disable: false },
    		nationality: { display: false, disable: false },
    		pr_status: { display: false, disable: false },
    		pr_id_number: { display: false, disable: false },
    		pr_country: { display: false, disable: false },
    		date_of_birth: { display: false, disable: false },
    		us_related: { display: true, disable: false },
    		educations_detail: { display: true, disable: false },
    		occupation: { display: true, disable: false },
    		job_title: { display: true, disable: false },
    		bmmb_staff: { display: true, disable: false },
    		bmmb_staff_id: { display: true, disable: false },
    		employment_type: { display: true, disable: false },
    		employment_sector: { display: true, disable: false },
    		monthly_basic_salary: { display: true, disable: false },
    		monthly_other_salary: { display: true, disable: false },
    		employer_name: { display: true, disable: false },
    		nature_of_business: { display: true, disable: false },
    		no_of_other_banks_used: { display: true, disable: false },
    		bmmb_high_net_worth: { display: true, disable: false },
    		pep_related: { display: true, disable: false },
    		local_address: { display: true, disable: false },
    		local_postal_code: { display: true, disable: false },
    		local_city: { display: true, disable: false },
    		local_state_code: { display: true, disable: false },
    		local_coutry: { display: true, disable: false },
    		foreign_address: { display: true, disable: false },
    		foreign_postal_code: { display: true, disable: false },
    		foreign_city: { display: true, disable: false },
    		foreign_state_code: { display: true, disable: false },
    		foreign_coutry: { display: true, disable: false },
    		mailing_address: { display: false, disable: false },
    		mailing_postal_code: { display: true, disable: false },
    		mailing_city: { display: true, disable: false },
    		mailing_state_code: { display: true, disable: false },
    		mailing_coutry: { display: true, disable: false },
    		property_ownership: { display: true, disable: false },
    		mobile_number: { display: true, disable: false },
    		office_number: { display: true, disable: false },
    		email_address: { display: true, disable: false },
    		race: { display: true, disable: false },
    		gender: { display: true, disable: false },
    		maritial_status: { display: true, disable: false },
    		spouse_name: { display: true, disable: false },
    		no_of_dependents: { display: true, disable: false },
    		contact_person_name: { display: true, disable: false },
    		contact_relationship: { display: true, disable: false },
    		contact_mobile_number: { display: true, disable: false },
    		bmmb_account_type: { display: true, disable: false },
    		purpose_of_account: { display: true, disable: false },
    		product_to_open: { display: true, disable: false },
    		prefered_branch: { display: true, disable: false }
    	};

    	let dob = "";

    	function update_dob(dob) {
    		$$invalidate(0, output.date_of_birth = dob, output);
    	}

    	let next_disabled = true;

    	function next_step1() {
    		if (step == 1) {
    			if (output.us_related == "") {
    				return true;
    			}

    			if (form_display.full_name.display && output.full_name == "") {
    				return true;
    			}

    			if (form_display.type_of_id.display && output.type_of_id == "") {
    				return true;
    			}

    			if (form_display.id_number.display && output.id_number == "") {
    				return true;
    			}

    			if (form_display.passport_number.display && output.passport_number == "") {
    				return true;
    			}

    			if (form_display.nationality.display && output.nationality == "") {
    				return true;
    			}

    			if (form_display.pr_status.display && output.pr_status == "") {
    				return true;
    			}

    			if (form_display.pr_id_number.display && output.pr_id_number == "") {
    				return true;
    			}

    			if (form_display.pr_country.display && output.pr_country == "") {
    				return true;
    			}

    			if (form_display.date_of_birth.display && output.date_of_birth == "") {
    				return true;
    			}
    		}

    		if (step == 2) {
    			if (form_display.monthly_basic_salary.display && output.monthly_basic_salary == "") {
    				return true;
    			}

    			if (form_display.monthly_other_salary.display && output.monthly_other_salary == "") {
    				return true;
    			}
    		}

    		if (step == 3) {
    			if (form_display.local_address.display && output.local_address == "") {
    				return true;
    			}

    			if (form_display.local_postal_code.display && output.local_postal_code == "") {
    				return true;
    			}

    			if (form_display.local_city.display && output.local_city == "") {
    				return true;
    			}

    			if (form_display.local_state_code.display && output.local_state_code == "") {
    				return true;
    			}

    			if (form_display.local_coutry.display && output.local_coutry == "") {
    				return true;
    			}
    		}

    		if (step == 4) {
    			if (form_display.mobile_number.display && output.mobile_number == "") {
    				return true;
    			}

    			if (form_display.email_address.display && output.email_address == "") {
    				return true;
    			}
    		}

    		if (step == 5) {
    			if (form_display.contact_person_name.display && output.contact_person_name == "") {
    				return true;
    			}

    			if (form_display.contact_mobile_number.display && output.contact_mobile_number == "") {
    				return true;
    			}
    		}

    		return false;
    	}

    	function next_page() {
    		$$invalidate(2, step += 1);

    		if (step > last_step) {
    			$$invalidate(2, step = 1);
    		}
    	}

    	function prev_page() {
    		$$invalidate(2, step -= 1);

    		if (step == 0) {
    			$$invalidate(2, step = 1);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function radio_output_binding(value) {
    		output.us_related = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding(value) {
    		output.full_name = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding(value) {
    		output.type_of_id = value;
    		$$invalidate(0, output);
    	}

    	function number_output_binding(value) {
    		output.id_number = value;
    		$$invalidate(0, output);
    	}

    	function number_output_binding_1(value) {
    		output.passport_number = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_1(value) {
    		output.nationality = value;
    		$$invalidate(0, output);
    	}

    	function radio_output_binding_1(value) {
    		output.pr_status = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_1(value) {
    		output.pr_id_number = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_2(value) {
    		output.pr_country = value;
    		$$invalidate(0, output);
    	}

    	function date_output_binding(value) {
    		output.date_of_birth = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_3(value) {
    		output.educations_detail = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_4(value) {
    		output.occupation = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_5(value) {
    		output.job_title = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_6(value) {
    		output.bmmb_staff = value;
    		$$invalidate(0, output);
    	}

    	function number_output_binding_2(value) {
    		output.bmmb_staff_id = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_7(value) {
    		output.employment_type = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_8(value) {
    		output.employment_sector = value;
    		$$invalidate(0, output);
    	}

    	function number_output_binding_3(value) {
    		output.monthly_basic_salary = value;
    		$$invalidate(0, output);
    	}

    	function number_output_binding_4(value) {
    		output.monthly_other_salary = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_2(value) {
    		output.employer_name = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_9(value) {
    		output.nature_of_business = value;
    		$$invalidate(0, output);
    	}

    	function number_output_binding_5(value) {
    		output.no_of_other_banks_used = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_10(value) {
    		output.bmmb_high_net_worth = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_11(value) {
    		output.pep_related = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_3(value) {
    		output.local_address = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_4(value) {
    		output.local_postal_code = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_5(value) {
    		output.local_city = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_6(value) {
    		output.local_state_code = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_7(value) {
    		output.local_coutry = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_8(value) {
    		output.foreign_address = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_9(value) {
    		output.foreign_postal_code = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_10(value) {
    		output.foreign_city = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_11(value) {
    		output.foreign_state_code = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_12(value) {
    		output.foreign_coutry = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_12(value) {
    		output.mail_same_local = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_13(value) {
    		output.mailing_address = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_14(value) {
    		output.mailing_postal_code = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_15(value) {
    		output.mailing_city = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_16(value) {
    		output.mailing_state_code = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_17(value) {
    		output.mailing_coutry = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_13(value) {
    		output.property_ownership = value;
    		$$invalidate(0, output);
    	}

    	function number_output_binding_6(value) {
    		output.mobile_number = value;
    		$$invalidate(0, output);
    	}

    	function number_output_binding_7(value) {
    		output.office_number = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_18(value) {
    		output.email_address = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_14(value) {
    		output.race = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_15(value) {
    		output.gender = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_16(value) {
    		output.maritial_status = value;
    		$$invalidate(0, output);
    	}

    	function number_output_binding_8(value) {
    		output.no_of_dependents = value;
    		$$invalidate(0, output);
    	}

    	function input_output_binding_19(value) {
    		output.contact_person_name = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_17(value) {
    		output.contact_relationship = value;
    		$$invalidate(0, output);
    	}

    	function number_output_binding_9(value) {
    		output.contact_mobile_number = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_18(value) {
    		output.bmmb_account_type = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_19(value) {
    		output.purpose_of_account = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_20(value) {
    		output.product_to_open = value;
    		$$invalidate(0, output);
    	}

    	function select_output_binding_21(value) {
    		output.prefered_branch = value;
    		$$invalidate(0, output);
    	}

    	$$self.$capture_state = () => ({
    		Input,
    		CheckBox,
    		Radio,
    		Select,
    		Number,
    		Date,
    		update_keyed_each,
    		output,
    		step,
    		last_step,
    		id_type_options,
    		nationality_options,
    		pr_status_options,
    		educations_detail_options,
    		occupation_options,
    		job_title_options,
    		bmmb_staff_options,
    		employment_type_options,
    		employment_sector_options,
    		nature_of_business_options,
    		bmmb_high_net_worth_options,
    		pep_related_options,
    		property_ownership_options,
    		race_options,
    		gender_options,
    		maritial_status_options,
    		contact_relationship_options,
    		bmmb_account_type_options,
    		purpose_of_account_options,
    		product_to_open_options,
    		prefered_branch_options,
    		form_display,
    		dob,
    		update_dob,
    		next_disabled,
    		next_step1,
    		next_page,
    		prev_page
    	});

    	$$self.$inject_state = $$props => {
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    		if ("step" in $$props) $$invalidate(2, step = $$props.step);
    		if ("last_step" in $$props) $$invalidate(4, last_step = $$props.last_step);
    		if ("id_type_options" in $$props) $$invalidate(5, id_type_options = $$props.id_type_options);
    		if ("nationality_options" in $$props) $$invalidate(6, nationality_options = $$props.nationality_options);
    		if ("pr_status_options" in $$props) $$invalidate(7, pr_status_options = $$props.pr_status_options);
    		if ("educations_detail_options" in $$props) $$invalidate(8, educations_detail_options = $$props.educations_detail_options);
    		if ("occupation_options" in $$props) $$invalidate(9, occupation_options = $$props.occupation_options);
    		if ("job_title_options" in $$props) $$invalidate(10, job_title_options = $$props.job_title_options);
    		if ("bmmb_staff_options" in $$props) $$invalidate(11, bmmb_staff_options = $$props.bmmb_staff_options);
    		if ("employment_type_options" in $$props) $$invalidate(12, employment_type_options = $$props.employment_type_options);
    		if ("employment_sector_options" in $$props) $$invalidate(13, employment_sector_options = $$props.employment_sector_options);
    		if ("nature_of_business_options" in $$props) $$invalidate(14, nature_of_business_options = $$props.nature_of_business_options);
    		if ("bmmb_high_net_worth_options" in $$props) $$invalidate(15, bmmb_high_net_worth_options = $$props.bmmb_high_net_worth_options);
    		if ("pep_related_options" in $$props) $$invalidate(16, pep_related_options = $$props.pep_related_options);
    		if ("property_ownership_options" in $$props) $$invalidate(17, property_ownership_options = $$props.property_ownership_options);
    		if ("race_options" in $$props) $$invalidate(18, race_options = $$props.race_options);
    		if ("gender_options" in $$props) $$invalidate(19, gender_options = $$props.gender_options);
    		if ("maritial_status_options" in $$props) $$invalidate(20, maritial_status_options = $$props.maritial_status_options);
    		if ("contact_relationship_options" in $$props) $$invalidate(21, contact_relationship_options = $$props.contact_relationship_options);
    		if ("bmmb_account_type_options" in $$props) $$invalidate(22, bmmb_account_type_options = $$props.bmmb_account_type_options);
    		if ("purpose_of_account_options" in $$props) $$invalidate(23, purpose_of_account_options = $$props.purpose_of_account_options);
    		if ("product_to_open_options" in $$props) $$invalidate(24, product_to_open_options = $$props.product_to_open_options);
    		if ("prefered_branch_options" in $$props) $$invalidate(25, prefered_branch_options = $$props.prefered_branch_options);
    		if ("form_display" in $$props) $$invalidate(1, form_display = $$props.form_display);
    		if ("dob" in $$props) $$invalidate(28, dob = $$props.dob);
    		if ("next_disabled" in $$props) $$invalidate(3, next_disabled = $$props.next_disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 if (output.type_of_id !== "passport") {
    				$$invalidate(0, output.nationality = "malaysia", output);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 console.log(output);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 if (output.us_related == "no") {
    				$$invalidate(1, form_display.full_name.display = true, form_display);
    				$$invalidate(1, form_display.type_of_id.display = true, form_display);
    				$$invalidate(1, form_display.nationality.display = true, form_display);

    				// form_display.pr_status.display = true;
    				// form_display.pr_id_number.display = true;
    				// form_display.pr_country.display = true;
    				$$invalidate(1, form_display.date_of_birth.display = true, form_display);
    			} else {
    				$$invalidate(1, form_display.full_name.display = false, form_display);
    				$$invalidate(1, form_display.type_of_id.display = false, form_display);
    				$$invalidate(1, form_display.nationality.display = false, form_display);
    				$$invalidate(1, form_display.date_of_birth.display = false, form_display);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*form_display, output*/ 3) {
    			// $: if (
    			// 	form_display.type_of_id.display &&
    			// 	!output.type_of_id == "passport"
    			// ) {
    			// 	form_display.id_number.display = true;
    			// 	form_display.passport_number.display = false;
    			// } else {
    			// 	form_display.id_number.display = false;
    			// 	form_display.passport_number.display = true;
    			// }
    			 $$invalidate(
    				1,
    				form_display.id_number.display = form_display.type_of_id.display && output.type_of_id != "passport"
    				? true
    				: false,
    				form_display
    			);
    		}

    		if ($$self.$$.dirty[0] & /*form_display, output*/ 3) {
    			 $$invalidate(
    				1,
    				form_display.passport_number.display = form_display.type_of_id.display && output.type_of_id == "passport"
    				? true
    				: false,
    				form_display
    			);
    		}

    		if ($$self.$$.dirty[0] & /*form_display, output*/ 3) {
    			 $$invalidate(
    				1,
    				form_display.nationality.disable = form_display.type_of_id.display && output.type_of_id != "passport"
    				? true
    				: false,
    				form_display
    			);
    		}

    		if ($$self.$$.dirty[0] & /*form_display, output*/ 3) {
    			 $$invalidate(
    				1,
    				form_display.pr_status.display = form_display.id_number.display && !(output.type_of_id == "mypr" || output.type_of_id == "passport")
    				? true
    				: false,
    				form_display
    			);
    		}

    		if ($$self.$$.dirty[0] & /*form_display, output*/ 3) {
    			 $$invalidate(
    				1,
    				form_display.pr_id_number.display = form_display.id_number.display && output.pr_status == "foreign pr"
    				? true
    				: false,
    				form_display
    			);
    		}

    		if ($$self.$$.dirty[0] & /*form_display, output*/ 3) {
    			 $$invalidate(
    				1,
    				form_display.pr_country.display = form_display.id_number.display && output.pr_status == "foreign pr"
    				? true
    				: false,
    				form_display
    			);
    		}

    		if ($$self.$$.dirty[0] & /*form_display, output*/ 3) {
    			 $$invalidate(
    				1,
    				form_display.date_of_birth.disable = form_display.id_number.display && output.type_of_id != "passport"
    				? true
    				: false,
    				form_display
    			);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 $$invalidate(1, form_display.bmmb_staff_id.display = output.bmmb_staff != "no" ? true : false, form_display);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 $$invalidate(1, form_display.employment_type.display = output.bmmb_staff != "yes" ? true : false, form_display);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 $$invalidate(1, form_display.employment_sector.display = output.bmmb_staff != "yes" ? true : false, form_display);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 $$invalidate(1, form_display.employer_name.display = output.bmmb_staff != "yes" ? true : false, form_display);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 $$invalidate(1, form_display.nature_of_business.display = output.bmmb_staff != "yes" ? true : false, form_display);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 $$invalidate(1, form_display.mailing_address.display = output.mail_same_local != "yes" ? true : false, form_display);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 $$invalidate(1, form_display.mailing_postal_code.display = output.mail_same_local != "yes" ? true : false, form_display);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 $$invalidate(1, form_display.mailing_city.display = output.mail_same_local != "yes" ? true : false, form_display);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 $$invalidate(1, form_display.mailing_state_code.display = output.mail_same_local != "yes" ? true : false, form_display);
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 $$invalidate(1, form_display.mailing_coutry.display = output.mail_same_local != "yes" ? true : false, form_display);
    		}

    		if ($$self.$$.dirty[0] & /*form_display, output, dob*/ 268435459) {
    			 if (form_display.date_of_birth.display && output.id_number.length >= 6) {
    				let century = output.id_number.slice(0, 2) > 21 ? "19" : "20";
    				let year = century + output.id_number.slice(0, 2);
    				let month = output.id_number.slice(2, 4);
    				let day = output.id_number.slice(4, 6);
    				$$invalidate(28, dob = `${year}-${month}-${day}`);
    				update_dob(dob);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*output*/ 1) {
    			 if (output.us_related == "no") {
    				$$invalidate(3, next_disabled = next_step1());
    			}
    		}
    	};

    	return [
    		output,
    		form_display,
    		step,
    		next_disabled,
    		last_step,
    		id_type_options,
    		nationality_options,
    		pr_status_options,
    		educations_detail_options,
    		occupation_options,
    		job_title_options,
    		bmmb_staff_options,
    		employment_type_options,
    		employment_sector_options,
    		nature_of_business_options,
    		bmmb_high_net_worth_options,
    		pep_related_options,
    		property_ownership_options,
    		race_options,
    		gender_options,
    		maritial_status_options,
    		contact_relationship_options,
    		bmmb_account_type_options,
    		purpose_of_account_options,
    		product_to_open_options,
    		prefered_branch_options,
    		next_page,
    		prev_page,
    		dob,
    		radio_output_binding,
    		input_output_binding,
    		select_output_binding,
    		number_output_binding,
    		number_output_binding_1,
    		select_output_binding_1,
    		radio_output_binding_1,
    		input_output_binding_1,
    		select_output_binding_2,
    		date_output_binding,
    		select_output_binding_3,
    		select_output_binding_4,
    		select_output_binding_5,
    		select_output_binding_6,
    		number_output_binding_2,
    		select_output_binding_7,
    		select_output_binding_8,
    		number_output_binding_3,
    		number_output_binding_4,
    		input_output_binding_2,
    		select_output_binding_9,
    		number_output_binding_5,
    		select_output_binding_10,
    		select_output_binding_11,
    		input_output_binding_3,
    		input_output_binding_4,
    		input_output_binding_5,
    		input_output_binding_6,
    		input_output_binding_7,
    		input_output_binding_8,
    		input_output_binding_9,
    		input_output_binding_10,
    		input_output_binding_11,
    		input_output_binding_12,
    		select_output_binding_12,
    		input_output_binding_13,
    		input_output_binding_14,
    		input_output_binding_15,
    		input_output_binding_16,
    		input_output_binding_17,
    		select_output_binding_13,
    		number_output_binding_6,
    		number_output_binding_7,
    		input_output_binding_18,
    		select_output_binding_14,
    		select_output_binding_15,
    		select_output_binding_16,
    		number_output_binding_8,
    		input_output_binding_19,
    		select_output_binding_17,
    		number_output_binding_9,
    		select_output_binding_18,
    		select_output_binding_19,
    		select_output_binding_20,
    		select_output_binding_21
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {}, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,

    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
