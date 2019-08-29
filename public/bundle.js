
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
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
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let spanish = {
      main: {
        name: 'Roberto Batty',
        work_at: 'Overseas Solutions',
        occupation: 'Desarrollador de Software',
        word_at: '  para  ',
        // description:
        //   'Here will be your description. Use this to describe what you do or whatever you feel best describes yourself to a potential employer',
        image: 'profilepic.jpg',
        // bio:
        //   'Use this bio section as your way of describing yourself and saying what you do, what technologies you like to use or feel most comfortable with, describing your personality, or whatever else you feel like throwing in.',
        // contactmessage:
        //   'Here is where you should write your message to readers to have them get in contact with you.',
        email: 'roberbatty@gmail.com',
        phone: '##',
        address: {
          street: '',
          city: 'Cartagena',
          state: 'Bolivar',
          country: 'Colombia',
          zip: '130014',
        },
        website: '##',
        resumedownload: null,
        social: [
          // {
          //   name: 'facebook',
          //   url: 'https://www.facebook.com/iaMuhammedErdem',
          //   className: 'profile-card-social__item facebook',
          //   icon: '#icon-facebook',
          // },
          {
            name: 'twitter',
            url: 'http://twitter.com/_rober19',
            className: 'profile-card-social__item link',
            icon: '#icon-twitter',
          },
          // {
          //   name: 'behance',
          //   url: 'http://googleplus.com/tbakerx',
          //   className: 'profile-card-social__item behance',
          //   icon: '#icon-behance',
          // },
          {
            name: 'linkedin',
            url: 'https://www.linkedin.com/in/robertobatty/',
            className: 'profile-card-social__item facebook',
            icon: '#linkedin',
          },
          // {
          //   name: 'instagram',
          //   url: 'http://instagram.com/tbaker_x',
          //   className: 'profile-card-social__item instagram',
          //   icon: '#icon-instagram',
          // },
          {
            name: 'github',
            url: 'http://github.com/rober19',
            className: 'profile-card-social__item instagram',
            icon: '#icon-github',
          },
          // {
          //   name: 'codepen',
          //   url: 'http://skype.com',
          //   className: 'profile-card-social__item codepen',
          //   icon: '#icon-codepen',
          // },
          // {
          //   name: 'link',
          //   url: 'http://skype.com',
          //   className: 'profile-card-social__item link',
          //   icon: '#icon-link',
          // },
        ],
      },
      resume: {
        show_skills: true,
        show_skills_tags: true,
        show_education: true,
        show_work: true,
        skillmessage: 'Estimando las habilidades primordiales',
        skills_title: 'Destrezas',
        education_title: 'Educación',
        work_title: 'Experiencia',
        education: [
          {
            school: 'Tecnologíco Comfenalco',
            degree: 'Ingeniería de Sistemas',
            graduated: '2020 - 2021 (Pendiente)',
            description: '... ',
          },
          {
            school: 'Tecnologíco Comfenalco',
            degree: 'Tecnología en Desarrollo de Software',
            graduated: '2017 - 2019 (Cursando)',
            description: '... ',
          },
          {
            school: 'Colegío Mixto La Popa',
            degree: 'Bachiller',
            graduated: 'November 2016',
            description:
              // 'Describe your experience at school, what you learned, what useful skills you have acquired etc.',
              '...',
          },
        ],
        work: [
          {
            company: 'Overseas Solutions',
            title: 'Desarrollador de Software',
            years: '2018 - Present',
            description:
              // 'Describe work, special projects, notable achievements, what technologies you have been working with, and anything else that would be useful for an employer to know.',
              'Proyectos de fuerte arquitectura, usando Java, PHP, JavaScript (NodeJS, Vue, Angular), apollados sobre bases SQL, NoSQL y plataformas como Heroku, Google Cloud, Firebase',
          },
          // {
          //   company: 'Super Cool Studio',
          //   title: 'Junior bug fixer',
          //   years: 'March 2007 - February 2010',
          //   description:
          //     'Describe work, special projects, notable achievements, what technologies you have been working with, and anything else that would be useful for an employer to know.',
          // },
        ],
        skills: [
          {
            name: 'Git',
            level: '55%',
          },
          {
            name: 'Node.js',
            level: '70%',
          },
          {
            name: 'Typescript',
            level: '60%',
          },
          {
            name: 'Java',
            level: '60%',
          },
          {
            name: 'HTML5',
            level: '50%',
          },
          {
            name: 'Js',
            level: '60%',
          },
          {
            name: 'CSS',
            level: '45%',
          },
          {
            name: 'MongoDB',
            level: '50%',
          },
          {
            name: 'SQL',
            level: '50%',
          },
        ],
        skills_tags_titles: {
          title_1: 'Herramientas que he usado en mi vida',
          lvl_1: 'Avanzado',
          lvl_2: 'Intermedio',
          lvl_3: 'Afición',
        },
        skills_tags: {
          advanced: [
            {
              name: 'Node.js',
            },
          ],
          intermediate: [
            {
              name: 'TypeScript',
            },
            {
              name: 'Angular (and AngularJS)',
            },
            {
              name: 'React',
            },
            {
              name: 'Vue',
            },
            {
              name: 'PHP',
            },
            {
              name: 'Cpanel',
            },
            {
              name: 'Firebase (firestore)',
            },
            {
              name: 'Google Cloud (datastore)',
            },
            {
              name: 'SQL',
            },
            {
              name: 'DevOps',
            },
            {
              name: 'C#',
            },
            {
              name: 'Heroku',
            },
            {
              name: 'Java',
            },
          ],
          hobby: [
            {
              name: 'Shell',
            },
            {
              name: 'MS-DOS',
            },
            {
              name: 'Powershell',
            },
            {
              name: 'Travis CI',
            },
            {
              name: 'npm (own package)',
            },
            {
              name: 'Azure',
            },
            {
              name: 'DevOps',
            },
            {
              name: 'Visual Basic',
            },
            {
              name: 'Pixel Art',
            },
            {
              name: 'Game Maker',
            },
            {
              name: 'Adobe Premiere',
            },
            {
              name: 'Adobe Photoshop',
            },
            {
              name: 'Adobe Illustrator',
            },
            {
              name: 'Ionic',
            },
            {
              name: 'Vsce Market (own snippets)',
            },
            {
              name: 'Go',
            },
            {
              name: 'Svelte',
            },
            {
              name: 'Markdown',
            },
          ],
        },
      },
      portfolio: {
        projects: [
          {
            title: 'Canadian Wanderlust',
            category: 'My Travel Blog for my post-university travels',
            image: 'canadian-wanderlust.jpg',
            url: 'https://www.canadianwanderlust.com',
          },
          {
            title: 'Fury Fighting Gear',
            category: '(offline now) A fighting gear company I started',
            image: 'fury-fighting-gear.jpg',
            url: 'http://www.timbakerdev.com',
          },
          {
            title: 'Original Thai Food',
            category: 'Website I built for a restaurant I like in Thailand',
            image: 'original-thai-food.jpg',
            url: 'http://www.timbakerdev.com/originalthaifood.github.io',
          },
          {
            title: 'Resume Website',
            category: 'A React based resume website template',
            image: 'resume-website.jpg',
            url: 'http://www.timbakerdev.com',
          },
          {
            title: 'Smirkspace',
            category: '(MVP Only) A React and Meteor based chat University project.',
            image: 'smirkspace.jpg',
            url: 'http://www.smirkspace.com',
          },
        ],
      },
    };

    let english = {
      main: {
        name: 'Roberto Batty',
        work_at: 'Overseas Solutions',
        occupation: 'Software Developer',
        word_at: ' at ',
        image: 'profilepic.jpg',
        email: 'roberbatty@gmail.com',
        phone: '##',
        address: {
          street: '',
          city: 'Cartagena',
          state: 'Bolivar',
          country: 'Colombia',
          zip: '130014',
        },
        website: '##',
        resumedownload: null,
        social: [
          // {
          //   name: 'facebook',
          //   url: 'https://www.facebook.com/iaMuhammedErdem',
          //   className: 'profile-card-social__item facebook',
          //   icon: '#icon-facebook',
          // },
          {
            name: 'twitter',
            url: 'http://twitter.com/_rober19',
            className: 'profile-card-social__item link',
            icon: '#icon-twitter',
          },
          // {
          //   name: 'behance',
          //   url: 'http://googleplus.com/tbakerx',
          //   className: 'profile-card-social__item behance',
          //   icon: '#icon-behance',
          // },
          {
            name: 'linkedin',
            url: 'https://www.linkedin.com/in/robertobatty/',
            className: 'profile-card-social__item facebook',
            icon: '#linkedin',
          },
          // {
          //   name: 'instagram',
          //   url: 'http://instagram.com/tbaker_x',
          //   className: 'profile-card-social__item instagram',
          //   icon: '#icon-instagram',
          // },
          {
            name: 'github',
            url: 'http://github.com/rober19',
            className: 'profile-card-social__item instagram',
            icon: '#icon-github',
          },
          // {
          //   name: 'codepen',
          //   url: 'http://skype.com',
          //   className: 'profile-card-social__item codepen',
          //   icon: '#icon-codepen',
          // },
          // {
          //   name: 'link',
          //   url: 'http://skype.com',
          //   className: 'profile-card-social__item link',
          //   icon: '#icon-link',
          // },
        ],
      },
      resume: {
        show_skills: true,
        show_skills_tags: true,
        show_education: true,
        show_work: true,
        skillmessage: '...',
        skills_title: 'Skills',
        education_title: 'Education',
        work_title: 'Work',
        education: [
          {
            school: 'Tecnologíco Comfenalco',
            degree: 'Systems Engineering Degree',
            graduated: '2020 - 2021 (Pending)',
            description: '... ',
          },
          {
            school: 'Tecnologíco Comfenalco',
            degree: 'Software Development Technology',
            graduated: '2017 - 2019 (Present)',
            description: '... ',
          },
          {
            school: 'Colegío Mixto La Popa',
            degree: 'Bachelor Degree',
            graduated: 'November 2016',
            description:
              // 'Describe your experience at school, what you learned, what useful skills you have acquired etc.',
              '...',
          },
        ],
        work: [
          {
            company: 'Overseas Solutions',
            title: 'Software Developer',
            years: '2018 - Present',
            description:
              // 'Describe work, special projects, notable achievements, what technologies you have been working with, and anything else that would be useful for an employer to know.',
              '...',
          },
          // {
          //   company: 'Super Cool Studio',
          //   title: 'Junior bug fixer',
          //   years: 'March 2007 - February 2010',
          //   description:
          //     'Describe work, special projects, notable achievements, what technologies you have been working with, and anything else that would be useful for an employer to know.',
          // },
        ],
        skills: [
          {
            name: 'Git',
            level: '55%',
          },
          {
            name: 'Node.js',
            level: '70%',
          },
          {
            name: 'Typescript',
            level: '60%',
          },
          {
            name: 'Java',
            level: '60%',
          },
          {
            name: 'HTML5',
            level: '50%',
          },
          {
            name: 'Js',
            level: '60%',
          },
          {
            name: 'CSS',
            level: '45%',
          },
          {
            name: 'MongoDB',
            level: '50%',
          },
          {
            name: 'SQL',
            level: '50%',
          },
        ],
        skills_tags_titles: {
          title_1: 'Tools that I have used in my life',
          lvl_1: 'Advanced',
          lvl_2: 'Intermediate',
          lvl_3: 'Hobby',
        },
        skills_tags: {
          advanced: [
            {
              name: 'Node.js',
            },
          ],
          intermediate: [
            {
              name: 'TypeScript',
            },
            {
              name: 'Angular (and AngularJS)',
            },
            {
              name: 'React',
            },
            {
              name: 'Vue',
            },
            {
              name: 'PHP',
            },
            {
              name: 'Cpanel',
            },
            {
              name: 'Firebase (firestore)',
            },
            {
              name: 'Google Cloud (datastore)',
            },
            {
              name: 'SQL',
            },
            {
              name: 'DevOps',
            },
            {
              name: 'C#',
            },
            {
              name: 'Heroku',
            },
            {
              name: 'Java',
            },
          ],
          hobby: [
            {
              name: 'Shell',
            },
            {
              name: 'MS-DOS',
            },
            {
              name: 'Powershell',
            },
            {
              name: 'Travis CI',
            },
            {
              name: 'npm (own package)',
            },
            {
              name: 'Azure',
            },
            {
              name: 'DevOps',
            },
            {
              name: 'Visual Basic',
            },
            {
              name: 'Pixel Art',
            },
            {
              name: 'Game Maker',
            },
            {
              name: 'Adobe Premiere',
            },
            {
              name: 'Adobe Photoshop',
            },
            {
              name: 'Adobe Illustrator',
            },
            {
              name: 'Ionic',
            },
            {
              name: 'Vsce Market (own snippets)',
            },
            {
              name: 'Go',
            },
            {
              name: 'Svelte',
            },
            {
              name: 'Markdown',
            },
          ],
        },
      },
      portfolio: {
        projects: [
          {
            title: 'Canadian Wanderlust',
            category: 'My Travel Blog for my post-university travels',
            image: 'canadian-wanderlust.jpg',
            url: 'https://www.canadianwanderlust.com',
          },
          {
            title: 'Fury Fighting Gear',
            category: '(offline now) A fighting gear company I started',
            image: 'fury-fighting-gear.jpg',
            url: 'http://www.timbakerdev.com',
          },
          {
            title: 'Original Thai Food',
            category: 'Website I built for a restaurant I like in Thailand',
            image: 'original-thai-food.jpg',
            url: 'http://www.timbakerdev.com/originalthaifood.github.io',
          },
          {
            title: 'Resume Website',
            category: 'A React based resume website template',
            image: 'resume-website.jpg',
            url: 'http://www.timbakerdev.com',
          },
          {
            title: 'Smirkspace',
            category: '(MVP Only) A React and Meteor based chat University project.',
            image: 'smirkspace.jpg',
            url: 'http://www.smirkspace.com',
          },
        ],
      },
    };

    const content_app = spanish;

    function createCount() {
      const { subscribe, set, update } = writable(spanish);

      return {
        subscribe,
        useEng: () => update(data => english),
        useEsp: () => update(data => spanish),
        reset: () => {},
      };
    }

    const db_content = createCount();

    /* src\components\resume\Resume.svelte generated by Svelte v3.9.1 */

    const file = "src\\components\\resume\\Resume.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i].name;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i].name;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i].name;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i].name;
    	child_ctx.className = list[i].className;
    	child_ctx.level = list[i].level;
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.company = list[i].company;
    	child_ctx.title = list[i].title;
    	child_ctx.years = list[i].years;
    	child_ctx.description = list[i].description;
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.degree = list[i].degree;
    	child_ctx.school = list[i].school;
    	child_ctx.graduated = list[i].graduated;
    	child_ctx.description = list[i].description;
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (189:4) {#if show_education}
    function create_if_block_3(ctx) {
    	var div4, div0, h1, span, t0_value = ctx.$db_content.resume.education_title + "", t0, t1, div3, div2, div1;

    	var each_value_5 = ctx.$db_content.resume.education;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	return {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(span, "class", "svelte-17o9ptd");
    			add_location(span, file, 193, 12, 3579);
    			attr(h1, "class", "svelte-17o9ptd");
    			add_location(h1, file, 191, 10, 3559);
    			attr(div0, "class", "three columns header-col svelte-17o9ptd");
    			add_location(div0, file, 190, 8, 3509);
    			attr(div1, "class", "twelve columns svelte-17o9ptd");
    			add_location(div1, file, 199, 12, 3756);
    			attr(div2, "class", "row item svelte-17o9ptd");
    			add_location(div2, file, 198, 10, 3720);
    			attr(div3, "class", "nine columns main-col svelte-17o9ptd");
    			add_location(div3, file, 197, 8, 3673);
    			attr(div4, "class", "row education svelte-17o9ptd");
    			add_location(div4, file, 189, 6, 3472);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div0);
    			append(div0, h1);
    			append(h1, span);
    			append(span, t0);
    			append(div4, t1);
    			append(div4, div3);
    			append(div3, div2);
    			append(div2, div1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$db_content) && t0_value !== (t0_value = ctx.$db_content.resume.education_title + "")) {
    				set_data(t0, t0_value);
    			}

    			if (changed.$db_content) {
    				each_value_5 = ctx.$db_content.resume.education;

    				for (var i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_5.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div4);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (202:14) {#each $db_content.resume.education as { degree, school, graduated, description }
    function create_each_block_5(ctx) {
    	var div, h3, t0_value = ctx.school + "", t0, t1, p0, t2_value = ctx.degree + "", t2, t3, span, t5, em, t6_value = ctx.graduated + "", t6, t7, p1, t8_value = ctx.description + "", t8, t9;

    	return {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			span = element("span");
    			span.textContent = "•";
    			t5 = space();
    			em = element("em");
    			t6 = text(t6_value);
    			t7 = space();
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			attr(h3, "class", "svelte-17o9ptd");
    			add_location(h3, file, 203, 18, 3938);
    			attr(span, "class", "svelte-17o9ptd");
    			add_location(span, file, 206, 20, 4043);
    			attr(em, "class", "date svelte-17o9ptd");
    			add_location(em, file, 207, 20, 4084);
    			attr(p0, "class", "info svelte-17o9ptd");
    			add_location(p0, file, 204, 18, 3975);
    			attr(p1, "class", "svelte-17o9ptd");
    			add_location(p1, file, 209, 18, 4161);
    			attr(div, "key", ctx.i);
    			attr(div, "class", "svelte-17o9ptd");
    			add_location(div, file, 202, 16, 3905);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    			append(h3, t0);
    			append(div, t1);
    			append(div, p0);
    			append(p0, t2);
    			append(p0, t3);
    			append(p0, span);
    			append(p0, t5);
    			append(p0, em);
    			append(em, t6);
    			append(div, t7);
    			append(div, p1);
    			append(p1, t8);
    			append(div, t9);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$db_content) && t0_value !== (t0_value = ctx.school + "")) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.$db_content) && t2_value !== (t2_value = ctx.degree + "")) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.$db_content) && t6_value !== (t6_value = ctx.graduated + "")) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.$db_content) && t8_value !== (t8_value = ctx.description + "")) {
    				set_data(t8, t8_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (220:4) {#if show_work}
    function create_if_block_2(ctx) {
    	var div2, div0, h1, span, t0_value = ctx.$db_content.resume.work_title + "", t0, t1, div1;

    	var each_value_4 = ctx.$db_content.resume.work;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(span, "class", "svelte-17o9ptd");
    			add_location(span, file, 224, 12, 4442);
    			attr(h1, "class", "svelte-17o9ptd");
    			add_location(h1, file, 223, 10, 4424);
    			attr(div0, "class", "three columns header-col svelte-17o9ptd");
    			add_location(div0, file, 222, 8, 4374);
    			attr(div1, "class", "nine columns main-col svelte-17o9ptd");
    			add_location(div1, file, 228, 8, 4531);
    			attr(div2, "class", "row work svelte-17o9ptd");
    			add_location(div2, file, 220, 6, 4340);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, h1);
    			append(h1, span);
    			append(span, t0);
    			append(div2, t1);
    			append(div2, div1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$db_content) && t0_value !== (t0_value = ctx.$db_content.resume.work_title + "")) {
    				set_data(t0, t0_value);
    			}

    			if (changed.$db_content) {
    				each_value_4 = ctx.$db_content.resume.work;

    				for (var i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_4.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (231:10) {#each $db_content.resume.work as { company, title, years, description }
    function create_each_block_4(ctx) {
    	var div, h3, t0_value = ctx.company + "", t0, t1, p0, t2_value = ctx.title + "", t2, t3, span, t5, em, t6_value = ctx.years + "", t6, t7, p1, t8_value = ctx.description + "", t8, t9, div_key_value;

    	return {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			span = element("span");
    			span.textContent = "•";
    			t5 = space();
    			em = element("em");
    			t6 = text(t6_value);
    			t7 = space();
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			attr(h3, "class", "svelte-17o9ptd");
    			add_location(h3, file, 232, 14, 4705);
    			attr(span, "class", "svelte-17o9ptd");
    			add_location(span, file, 236, 16, 4800);
    			attr(em, "class", "date svelte-17o9ptd");
    			add_location(em, file, 237, 16, 4837);
    			attr(p0, "class", "info svelte-17o9ptd");
    			add_location(p0, file, 234, 14, 4741);
    			attr(p1, "class", "svelte-17o9ptd");
    			add_location(p1, file, 239, 14, 4902);
    			attr(div, "key", div_key_value = ctx.company);
    			attr(div, "class", "svelte-17o9ptd");
    			add_location(div, file, 231, 12, 4670);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    			append(h3, t0);
    			append(div, t1);
    			append(div, p0);
    			append(p0, t2);
    			append(p0, t3);
    			append(p0, span);
    			append(p0, t5);
    			append(p0, em);
    			append(em, t6);
    			append(div, t7);
    			append(div, p1);
    			append(p1, t8);
    			append(div, t9);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$db_content) && t0_value !== (t0_value = ctx.company + "")) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.$db_content) && t2_value !== (t2_value = ctx.title + "")) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.$db_content) && t6_value !== (t6_value = ctx.years + "")) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.$db_content) && t8_value !== (t8_value = ctx.description + "")) {
    				set_data(t8, t8_value);
    			}

    			if ((changed.$db_content) && div_key_value !== (div_key_value = ctx.company)) {
    				attr(div, "key", div_key_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (248:4) {#if show_skills}
    function create_if_block_1(ctx) {
    	var div3, div0, h1, span, t0_value = ctx.$db_content.resume.skills_title + "", t0, t1, div2, p, t2_value = ctx.$db_content.resume.skillmessage + "", t2, t3, div1, ul;

    	var each_value_3 = ctx.$db_content.resume.skills;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	return {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div2 = element("div");
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			ul = element("ul");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(span, "class", "svelte-17o9ptd");
    			add_location(span, file, 252, 12, 5140);
    			attr(h1, "class", "svelte-17o9ptd");
    			add_location(h1, file, 251, 10, 5122);
    			attr(div0, "class", "three columns header-col svelte-17o9ptd");
    			add_location(div0, file, 250, 8, 5072);
    			attr(p, "class", "svelte-17o9ptd");
    			add_location(p, file, 258, 10, 5280);
    			attr(ul, "class", "skills svelte-17o9ptd");
    			add_location(ul, file, 261, 12, 5366);
    			attr(div1, "class", "bars svelte-17o9ptd");
    			add_location(div1, file, 260, 10, 5334);
    			attr(div2, "class", "nine columns main-col svelte-17o9ptd");
    			add_location(div2, file, 256, 8, 5231);
    			attr(div3, "class", "row skill svelte-17o9ptd");
    			add_location(div3, file, 248, 6, 5037);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div0);
    			append(div0, h1);
    			append(h1, span);
    			append(span, t0);
    			append(div3, t1);
    			append(div3, div2);
    			append(div2, p);
    			append(p, t2);
    			append(div2, t3);
    			append(div2, div1);
    			append(div1, ul);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$db_content) && t0_value !== (t0_value = ctx.$db_content.resume.skills_title + "")) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.$db_content) && t2_value !== (t2_value = ctx.$db_content.resume.skillmessage + "")) {
    				set_data(t2, t2_value);
    			}

    			if (changed.$db_content) {
    				each_value_3 = ctx.$db_content.resume.skills;

    				for (var i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_3.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (263:14) {#each $db_content.resume.skills as { name, className, level }
    function create_each_block_3(ctx) {
    	var li, span, span_class_value, t0, em, t1_value = ctx.name + "", t1, t2, li_key_value;

    	return {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			t0 = space();
    			em = element("em");
    			t1 = text(t1_value);
    			t2 = space();
    			set_style(span, "width", "" + ctx.level + "\r\n                    ");
    			attr(span, "class", span_class_value = "bar-expand " + ctx.name.toLowerCase() + " svelte-17o9ptd");
    			add_location(span, file, 264, 18, 5520);
    			attr(em, "class", "svelte-17o9ptd");
    			add_location(em, file, 268, 18, 5676);
    			attr(li, "key", li_key_value = ctx.name);
    			attr(li, "class", "svelte-17o9ptd");
    			add_location(li, file, 263, 16, 5485);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, span);
    			append(li, t0);
    			append(li, em);
    			append(em, t1);
    			append(li, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.$db_content) {
    				set_style(span, "width", "" + ctx.level + "\r\n                    ");
    			}

    			if ((changed.$db_content) && span_class_value !== (span_class_value = "bar-expand " + ctx.name.toLowerCase() + " svelte-17o9ptd")) {
    				attr(span, "class", span_class_value);
    			}

    			if ((changed.$db_content) && t1_value !== (t1_value = ctx.name + "")) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.$db_content) && li_key_value !== (li_key_value = ctx.name)) {
    				attr(li, "key", li_key_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}
    		}
    	};
    }

    // (278:4) {#if show_skills_tags}
    function create_if_block(ctx) {
    	var div5, div4, center, div0, h10, t0_value = ctx.$db_content.resume.skills_tags_titles.title_1 + "", t0, t1, div1, h11, span0, t2_value = ctx.$db_content.resume.skills_tags_titles.lvl_1 + "", t2, t3, ul0, t4, div2, h12, span1, t5_value = ctx.$db_content.resume.skills_tags_titles.lvl_2 + "", t5, t6, ul1, t7, div3, h13, span2, t8_value = ctx.$db_content.resume.skills_tags_titles.lvl_3 + "", t8, t9, ul2;

    	var each_value_2 = ctx.$db_content.resume.skills_tags.advanced;

    	var each_blocks_2 = [];

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	var each_value_1 = ctx.$db_content.resume.skills_tags.intermediate;

    	var each_blocks_1 = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	var each_value = ctx.$db_content.resume.skills_tags.hobby;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			center = element("center");
    			div0 = element("div");
    			h10 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			h11 = element("h1");
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			ul0 = element("ul");

    			for (var i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t4 = space();
    			div2 = element("div");
    			h12 = element("h1");
    			span1 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			ul1 = element("ul");

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			div3 = element("div");
    			h13 = element("h1");
    			span2 = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			ul2 = element("ul");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			set_style(h10, "font-size", "25px");
    			attr(h10, "class", "svelte-17o9ptd");
    			add_location(h10, file, 282, 14, 5958);
    			attr(div0, "class", "svelte-17o9ptd");
    			add_location(div0, file, 281, 12, 5937);
    			attr(center, "class", "svelte-17o9ptd");
    			add_location(center, file, 280, 10, 5915);
    			attr(span0, "class", "svelte-17o9ptd");
    			add_location(span0, file, 290, 14, 6185);
    			attr(h11, "class", "svelte-17o9ptd");
    			add_location(h11, file, 289, 12, 6165);
    			attr(div1, "class", "header-col svelte-17o9ptd");
    			add_location(div1, file, 288, 10, 6127);
    			attr(ul0, "class", "tags  svelte-17o9ptd");
    			add_location(ul0, file, 294, 10, 6294);
    			attr(span1, "class", "svelte-17o9ptd");
    			add_location(span1, file, 305, 14, 6597);
    			attr(h12, "class", "svelte-17o9ptd");
    			add_location(h12, file, 304, 12, 6577);
    			attr(div2, "class", "header-col svelte-17o9ptd");
    			add_location(div2, file, 303, 10, 6539);
    			attr(ul1, "class", "tags svelte-17o9ptd");
    			add_location(ul1, file, 309, 10, 6706);
    			attr(span2, "class", "svelte-17o9ptd");
    			add_location(span2, file, 320, 14, 7012);
    			attr(h13, "class", "svelte-17o9ptd");
    			add_location(h13, file, 319, 12, 6992);
    			attr(div3, "class", "header-col svelte-17o9ptd");
    			add_location(div3, file, 318, 10, 6954);
    			attr(ul2, "class", "tags svelte-17o9ptd");
    			add_location(ul2, file, 324, 10, 7121);
    			attr(div4, "class", "col-md-12 svelte-17o9ptd");
    			add_location(div4, file, 279, 8, 5880);
    			attr(div5, "class", "row svelte-17o9ptd");
    			add_location(div5, file, 278, 6, 5853);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div4);
    			append(div4, center);
    			append(center, div0);
    			append(div0, h10);
    			append(h10, t0);
    			append(div4, t1);
    			append(div4, div1);
    			append(div1, h11);
    			append(h11, span0);
    			append(span0, t2);
    			append(div4, t3);
    			append(div4, ul0);

    			for (var i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(ul0, null);
    			}

    			append(div4, t4);
    			append(div4, div2);
    			append(div2, h12);
    			append(h12, span1);
    			append(span1, t5);
    			append(div4, t6);
    			append(div4, ul1);

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul1, null);
    			}

    			append(div4, t7);
    			append(div4, div3);
    			append(div3, h13);
    			append(h13, span2);
    			append(span2, t8);
    			append(div4, t9);
    			append(div4, ul2);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul2, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$db_content) && t0_value !== (t0_value = ctx.$db_content.resume.skills_tags_titles.title_1 + "")) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.$db_content) && t2_value !== (t2_value = ctx.$db_content.resume.skills_tags_titles.lvl_1 + "")) {
    				set_data(t2, t2_value);
    			}

    			if (changed.$db_content) {
    				each_value_2 = ctx.$db_content.resume.skills_tags.advanced;

    				for (var i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(changed, child_ctx);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}
    				each_blocks_2.length = each_value_2.length;
    			}

    			if ((changed.$db_content) && t5_value !== (t5_value = ctx.$db_content.resume.skills_tags_titles.lvl_2 + "")) {
    				set_data(t5, t5_value);
    			}

    			if (changed.$db_content) {
    				each_value_1 = ctx.$db_content.resume.skills_tags.intermediate;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if ((changed.$db_content) && t8_value !== (t8_value = ctx.$db_content.resume.skills_tags_titles.lvl_3 + "")) {
    				set_data(t8, t8_value);
    			}

    			if (changed.$db_content) {
    				each_value = ctx.$db_content.resume.skills_tags.hobby;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div5);
    			}

    			destroy_each(each_blocks_2, detaching);

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (296:12) {#each $db_content.resume.skills_tags.advanced as { name }}
    function create_each_block_2(ctx) {
    	var li, a, t0_value = ctx.name + "", t0, t1;

    	return {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr(a, "href", "##");
    			attr(a, "class", "tag tag_1 svelte-17o9ptd");
    			add_location(a, file, 297, 16, 6423);
    			attr(li, "class", "svelte-17o9ptd");
    			add_location(li, file, 296, 14, 6401);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t0);
    			append(li, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$db_content) && t0_value !== (t0_value = ctx.name + "")) {
    				set_data(t0, t0_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}
    		}
    	};
    }

    // (311:12) {#each $db_content.resume.skills_tags.intermediate as { name }}
    function create_each_block_1(ctx) {
    	var li, a, t0_value = ctx.name + "", t0, t1;

    	return {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr(a, "href", "##");
    			attr(a, "class", "tag tag_2 svelte-17o9ptd");
    			add_location(a, file, 312, 16, 6838);
    			attr(li, "class", "svelte-17o9ptd");
    			add_location(li, file, 311, 14, 6816);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t0);
    			append(li, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$db_content) && t0_value !== (t0_value = ctx.name + "")) {
    				set_data(t0, t0_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}
    		}
    	};
    }

    // (326:12) {#each $db_content.resume.skills_tags.hobby as { name }}
    function create_each_block(ctx) {
    	var li, a, t0_value = ctx.name + "", t0, t1;

    	return {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr(a, "href", "##");
    			attr(a, "class", "tag tag_3 svelte-17o9ptd");
    			add_location(a, file, 327, 16, 7246);
    			attr(li, "class", "svelte-17o9ptd");
    			add_location(li, file, 326, 14, 7224);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, a);
    			append(a, t0);
    			append(li, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$db_content) && t0_value !== (t0_value = ctx.name + "")) {
    				set_data(t0, t0_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}
    		}
    	};
    }

    function create_fragment(ctx) {
    	var t0, div, section, t1, t2, t3;

    	var if_block0 = (ctx.show_education) && create_if_block_3(ctx);

    	var if_block1 = (ctx.show_work) && create_if_block_2(ctx);

    	var if_block2 = (ctx.show_skills) && create_if_block_1(ctx);

    	var if_block3 = (ctx.show_skills_tags) && create_if_block(ctx);

    	return {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			attr(section, "id", "resume");
    			attr(section, "class", "svelte-17o9ptd");
    			add_location(section, file, 186, 2, 3415);
    			attr(div, "class", "container svelte-17o9ptd");
    			add_location(div, file, 185, 0, 3388);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, section);
    			if (if_block0) if_block0.m(section, null);
    			append(section, t1);
    			if (if_block1) if_block1.m(section, null);
    			append(section, t2);
    			if (if_block2) if_block2.m(section, null);
    			append(section, t3);
    			if (if_block3) if_block3.m(section, null);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.show_education) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(section, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.show_work) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(section, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (ctx.show_skills) {
    				if (if_block2) {
    					if_block2.p(changed, ctx);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(section, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (ctx.show_skills_tags) {
    				if (if_block3) {
    					if_block3.p(changed, ctx);
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					if_block3.m(section, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t0);
    				detach(div);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $db_content;

    	validate_store(db_content, 'db_content');
    	component_subscribe($$self, db_content, $$value => { $db_content = $$value; $$invalidate('$db_content', $db_content); });

    	// let show_content = content_app.resume;
      let {
        work_title,
        education_title,
        skills_tags,
        skills,
        work,
        education,
        skillmessage,
        show_education,
        show_work,
        show_skills_tags,
        show_skills,
        skills_title,
        skills_tags_titles
      } = content_app.resume;

    	return {
    		show_education,
    		show_work,
    		show_skills_tags,
    		show_skills,
    		$db_content
    	};
    }

    class Resume extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src\components\presentation\Presentation.svelte generated by Svelte v3.9.1 */

    const file$1 = "src\\components\\presentation\\Presentation.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i].name;
    	child_ctx.className = list[i].className;
    	child_ctx.url = list[i].url;
    	child_ctx.icon = list[i].icon;
    	child_ctx.iconclass = list[i].iconclass;
    	return child_ctx;
    }

    // (396:8) {#each social as { name, className, url, icon, iconclass }}
    function create_each_block$1(ctx) {
    	var a, span, svg, use, use_xlink_href_value, t, a_href_value, a_class_value;

    	return {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t = space();
    			xlink_attr(use, "xlink:href", use_xlink_href_value = ctx.icon);
    			attr(use, "class", "svelte-iuuxyk");
    			add_location(use, file$1, 399, 16, 11825);
    			attr(svg, "class", "icon svelte-iuuxyk");
    			add_location(svg, file$1, 398, 14, 11789);
    			attr(span, "class", "icon-font svelte-iuuxyk");
    			add_location(span, file$1, 397, 12, 11749);
    			attr(a, "href", a_href_value = ctx.url);
    			attr(a, "class", a_class_value = "" + null_to_empty(ctx.className) + " svelte-iuuxyk");
    			attr(a, "target", "_blank");
    			add_location(a, file$1, 396, 10, 11687);
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);
    			append(a, span);
    			append(span, svg);
    			append(svg, use);
    			append(a, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div25, div24, div0, img, t0, div19, div1, t1, t2, div2, t3_value = ctx.$db_content.main.occupation + "", t3, t4, t5_value = ctx.$db_content.main.word_at + "", t5, t6, strong, t7_value = ctx.$db_content.main.work_at + "", t7, t8, div3, span0, svg0, use, t9, span1, t10, t11, t12, t13, div16, div6, div4, t15, div5, t17, div9, div7, t19, div8, t21, div12, div10, t23, div11, t25, div15, div13, t27, div14, t29, div17, t30, div18, button0, t32, button1, t34, div23, form, div20, textarea, t35, div21, button2, t37, button3, t39, div22, t40, i, t41, svg2, defs, symbol0, title0, t42, path0, symbol1, title1, t43, path1, path2, path3, path4, path5, path6, path7, path8, symbol2, title2, t44, path9, path10, symbol3, title3, t45, path11, symbol4, title4, t46, path12, path13, path14, symbol5, title5, t47, path15, symbol6, title6, t48, path16, path17, path18, symbol7, title7, t49, path19, path20, svg1, path21, dispose;

    	var each_value = ctx.social;

    	var each_blocks = [];

    	for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    		each_blocks[i_1] = create_each_block$1(get_each_context$1(ctx, each_value, i_1));
    	}

    	return {
    		c: function create() {
    			div25 = element("div");
    			div24 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div19 = element("div");
    			div1 = element("div");
    			t1 = text(ctx.name);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			strong = element("strong");
    			t7 = text(t7_value);
    			t8 = space();
    			div3 = element("div");
    			span0 = element("span");
    			svg0 = svg_element("svg");
    			use = svg_element("use");
    			t9 = space();
    			span1 = element("span");
    			t10 = text(ctx.city);
    			t11 = text(", ");
    			t12 = text(ctx.country);
    			t13 = space();
    			div16 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "1598";
    			t15 = space();
    			div5 = element("div");
    			div5.textContent = "Followers";
    			t17 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div7.textContent = "65";
    			t19 = space();
    			div8 = element("div");
    			div8.textContent = "Following";
    			t21 = space();
    			div12 = element("div");
    			div10 = element("div");
    			div10.textContent = "123";
    			t23 = space();
    			div11 = element("div");
    			div11.textContent = "Articles";
    			t25 = space();
    			div15 = element("div");
    			div13 = element("div");
    			div13.textContent = "85";
    			t27 = space();
    			div14 = element("div");
    			div14.textContent = "Works";
    			t29 = space();
    			div17 = element("div");

    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].c();
    			}

    			t30 = space();
    			div18 = element("div");
    			button0 = element("button");
    			button0.textContent = "Español";
    			t32 = space();
    			button1 = element("button");
    			button1.textContent = "English";
    			t34 = space();
    			div23 = element("div");
    			form = element("form");
    			div20 = element("div");
    			textarea = element("textarea");
    			t35 = space();
    			div21 = element("div");
    			button2 = element("button");
    			button2.textContent = "Send";
    			t37 = space();
    			button3 = element("button");
    			button3.textContent = "Cancel";
    			t39 = space();
    			div22 = element("div");
    			t40 = space();
    			i = element("i");
    			t41 = space();
    			svg2 = svg_element("svg");
    			defs = svg_element("defs");
    			symbol0 = svg_element("symbol");
    			title0 = svg_element("title");
    			t42 = text("codepen");
    			path0 = svg_element("path");
    			symbol1 = svg_element("symbol");
    			title1 = svg_element("title");
    			t43 = text("github");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			symbol2 = svg_element("symbol");
    			title2 = svg_element("title");
    			t44 = text("location");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			symbol3 = svg_element("symbol");
    			title3 = svg_element("title");
    			t45 = text("facebook");
    			path11 = svg_element("path");
    			symbol4 = svg_element("symbol");
    			title4 = svg_element("title");
    			t46 = text("instagram");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			symbol5 = svg_element("symbol");
    			title5 = svg_element("title");
    			t47 = text("twitter");
    			path15 = svg_element("path");
    			symbol6 = svg_element("symbol");
    			title6 = svg_element("title");
    			t48 = text("behance");
    			path16 = svg_element("path");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			symbol7 = svg_element("symbol");
    			title7 = svg_element("title");
    			t49 = text("link");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			svg1 = svg_element("svg");
    			path21 = svg_element("path");
    			attr(img, "alt", "Image");
    			attr(img, "src", ctx.profilepic);
    			attr(img, "class", "svelte-iuuxyk");
    			add_location(img, file$1, 353, 6, 10153);
    			attr(div0, "class", "profile-card__img svelte-iuuxyk");
    			add_location(div0, file$1, 352, 4, 10114);
    			attr(div1, "class", "profile-card__name svelte-iuuxyk");
    			add_location(div1, file$1, 357, 6, 10264);
    			attr(strong, "class", "svelte-iuuxyk");
    			add_location(strong, file$1, 359, 65, 10414);
    			attr(div2, "class", "profile-card__txt svelte-iuuxyk");
    			add_location(div2, file$1, 358, 6, 10316);
    			xlink_attr(use, "xlink:href", "#icon-location");
    			attr(use, "class", "svelte-iuuxyk");
    			add_location(use, file$1, 364, 12, 10600);
    			attr(svg0, "class", "icon svelte-iuuxyk");
    			add_location(svg0, file$1, 363, 10, 10568);
    			attr(span0, "class", "profile-card-loc__icon svelte-iuuxyk");
    			add_location(span0, file$1, 362, 8, 10519);
    			attr(span1, "class", "profile-card-loc__txt svelte-iuuxyk");
    			add_location(span1, file$1, 368, 8, 10682);
    			attr(div3, "class", "profile-card-loc svelte-iuuxyk");
    			add_location(div3, file$1, 361, 6, 10479);
    			attr(div4, "class", "profile-card-inf__title svelte-iuuxyk");
    			add_location(div4, file$1, 373, 10, 10876);
    			attr(div5, "class", "profile-card-inf__txt svelte-iuuxyk");
    			add_location(div5, file$1, 374, 10, 10935);
    			attr(div6, "class", "profile-card-inf__item svelte-iuuxyk");
    			add_location(div6, file$1, 372, 8, 10828);
    			attr(div7, "class", "profile-card-inf__title svelte-iuuxyk");
    			add_location(div7, file$1, 378, 10, 11061);
    			attr(div8, "class", "profile-card-inf__txt svelte-iuuxyk");
    			add_location(div8, file$1, 379, 10, 11118);
    			attr(div9, "class", "profile-card-inf__item svelte-iuuxyk");
    			add_location(div9, file$1, 377, 8, 11013);
    			attr(div10, "class", "profile-card-inf__title svelte-iuuxyk");
    			add_location(div10, file$1, 383, 10, 11244);
    			attr(div11, "class", "profile-card-inf__txt svelte-iuuxyk");
    			add_location(div11, file$1, 384, 10, 11302);
    			attr(div12, "class", "profile-card-inf__item svelte-iuuxyk");
    			add_location(div12, file$1, 382, 8, 11196);
    			attr(div13, "class", "profile-card-inf__title svelte-iuuxyk");
    			add_location(div13, file$1, 388, 10, 11428);
    			attr(div14, "class", "profile-card-inf__txt svelte-iuuxyk");
    			add_location(div14, file$1, 389, 10, 11485);
    			attr(div15, "class", "profile-card-inf__item  svelte-iuuxyk");
    			add_location(div15, file$1, 387, 8, 11379);
    			attr(div16, "class", "profile-card-inf svelte-iuuxyk");
    			set_style(div16, "display", "none");
    			add_location(div16, file$1, 371, 6, 10766);
    			attr(div17, "class", "profile-card-social svelte-iuuxyk");
    			add_location(div17, file$1, 393, 6, 11571);
    			attr(button0, "class", "profile-card__button button--blue js-message-btn svelte-iuuxyk");
    			add_location(button0, file$1, 408, 8, 11993);
    			attr(button1, "class", "profile-card__button button--orange svelte-iuuxyk");
    			add_location(button1, file$1, 411, 8, 12135);
    			attr(div18, "class", "profile-card-ctr svelte-iuuxyk");
    			add_location(div18, file$1, 407, 6, 11952);
    			attr(div19, "class", "profile-card__cnt js-profile-cnt svelte-iuuxyk");
    			add_location(div19, file$1, 356, 4, 10210);
    			attr(textarea, "placeholder", "Say something...");
    			attr(textarea, "class", "svelte-iuuxyk");
    			add_location(textarea, file$1, 418, 10, 12438);
    			attr(div20, "class", "profile-card-form__container svelte-iuuxyk");
    			add_location(div20, file$1, 417, 8, 12384);
    			attr(button2, "class", "profile-card__button button--blue js-message-close svelte-iuuxyk");
    			add_location(button2, file$1, 422, 10, 12560);
    			attr(button3, "class", "profile-card__button button--gray js-message-close svelte-iuuxyk");
    			add_location(button3, file$1, 426, 10, 12680);
    			attr(div21, "class", "profile-card-form__bottom svelte-iuuxyk");
    			add_location(div21, file$1, 421, 8, 12509);
    			attr(form, "class", "profile-card-form svelte-iuuxyk");
    			add_location(form, file$1, 416, 6, 12342);
    			attr(div22, "class", "profile-card__overlay js-message-close svelte-iuuxyk");
    			add_location(div22, file$1, 432, 6, 12829);
    			attr(div23, "class", "profile-card-message js-message svelte-iuuxyk");
    			set_style(div23, "display", "none");
    			add_location(div23, file$1, 415, 4, 12267);
    			attr(div24, "class", "profile-card js-profile-card svelte-iuuxyk");
    			add_location(div24, file$1, 351, 2, 10066);
    			attr(div25, "class", "wrapper svelte-iuuxyk");
    			add_location(div25, file$1, 349, 0, 10039);
    			attr(i, "data-fa-symbol", "delete");
    			attr(i, "class", "fas a-trash fa-fw svelte-iuuxyk");
    			add_location(i, file$1, 439, 0, 12921);
    			attr(title0, "class", "svelte-iuuxyk");
    			add_location(title0, file$1, 444, 6, 13071);
    			attr(path0, "d", "M31.872 10.912v-0.032c0-0.064 0-0.064 0-0.096v-0.064c0-0.064\r\n        0-0.064-0.064-0.096 0 0 0-0.064-0.064-0.064\r\n        0-0.064-0.064-0.064-0.064-0.096 0 0 0-0.064-0.064-0.064\r\n        0-0.064-0.064-0.064-0.064-0.096l-0.192-0.192v-0.064l-0.064-0.064-14.592-9.696c-0.448-0.32-1.056-0.32-1.536\r\n        0l-14.528 9.696-0.32 0.32c0 0-0.064 0.064-0.064 0.096 0 0 0 0.064-0.064\r\n        0.064 0 0.064-0.064 0.064-0.064 0.096 0 0 0 0.064-0.064 0.064 0 0.064 0\r\n        0.064-0.064 0.096v0.064c0 0.064 0 0.064 0 0.096v0.064c0 0.064 0 0.096 0\r\n        0.16v9.696c0 0.064 0 0.096 0 0.16v0.064c0 0.064 0 0.064 0 0.096v0.064c0\r\n        0.064 0 0.064 0.064 0.096 0 0 0 0.064 0.064 0.064 0 0.064 0.064 0.064\r\n        0.064 0.096 0 0 0 0.064 0.064 0.064 0 0.064 0.064 0.064 0.064\r\n        0.096l0.256 0.256 0.064 0.032 14.528 9.728c0.224 0.16 0.48 0.224 0.768\r\n        0.224s0.544-0.064 0.768-0.224l14.528-9.728 0.32-0.32c0 0 0.064-0.064\r\n        0.064-0.096 0 0 0-0.064 0.064-0.064 0-0.064 0.064-0.064 0.064-0.096 0 0\r\n        0-0.064 0.064-0.064 0-0.064 0-0.064 0.064-0.096v-0.032c0-0.064 0-0.064\r\n        0-0.096v-0.064c0-0.064 0-0.096 0-0.16v-9.664c0-0.064 0-0.096\r\n        0-0.224zM17.312 4l10.688 7.136-4.768 3.168-5.92-3.936v-6.368zM14.56\r\n        4v6.368l-5.92 3.968-4.768-3.168 10.688-7.168zM2.784 13.664l3.392\r\n        2.304-3.392 2.304c0 0 0-4.608 0-4.608zM14.56 28l-10.688-7.136 4.768-3.2\r\n        5.92 3.936v6.4zM15.936 19.2l-4.832-3.232 4.832-3.232 4.832 3.232-4.832\r\n        3.232zM17.312 28v-6.432l5.92-3.936 4.8 3.168-10.72 7.2zM29.12\r\n        18.272l-3.392-2.304 3.392-2.304v4.608z");
    			attr(path0, "class", "svelte-iuuxyk");
    			add_location(path0, file$1, 445, 6, 13101);
    			attr(symbol0, "id", "icon-codepen");
    			attr(symbol0, "viewBox", "0 0 32 32");
    			attr(symbol0, "class", "svelte-iuuxyk");
    			add_location(symbol0, file$1, 443, 4, 13017);
    			attr(title1, "class", "svelte-iuuxyk");
    			add_location(title1, file$1, 470, 6, 14787);
    			attr(path1, "d", "M16.192 0.512c-8.832 0-16 7.168-16 16 0 7.072 4.576 13.056 10.944\r\n        15.168 0.8 0.16 1.088-0.352 1.088-0.768 0-0.384\r\n        0-1.632-0.032-2.976-4.448\r\n        0.96-5.376-1.888-5.376-1.888-0.736-1.856-1.792-2.336-1.792-2.336-1.44-0.992\r\n        0.096-0.96 0.096-0.96 1.6 0.128 2.464 1.664 2.464 1.664 1.44 2.432 3.744\r\n        1.728 4.672 1.344 0.128-1.024 0.544-1.728\r\n        1.024-2.144-3.552-0.448-7.296-1.824-7.296-7.936 0-1.76 0.64-3.168\r\n        1.664-4.288-0.16-0.416-0.704-2.016 0.16-4.224 0 0 1.344-0.416 4.416\r\n        1.632 1.28-0.352 2.656-0.544 4-0.544s2.72 0.192 4 0.544c3.040-2.080\r\n        4.384-1.632 4.384-1.632 0.864 2.208 0.32 3.84 0.16 4.224 1.024 1.12\r\n        1.632 2.56 1.632 4.288 0 6.144-3.744 7.488-7.296 7.904 0.576 0.512 1.088\r\n        1.472 1.088 2.976 0 2.144-0.032 3.872-0.032 4.384 0 0.416 0.288 0.928\r\n        1.088 0.768 6.368-2.112 10.944-8.128 10.944-15.168\r\n        0-8.896-7.168-16.032-16-16.032z");
    			attr(path1, "class", "svelte-iuuxyk");
    			add_location(path1, file$1, 471, 6, 14816);
    			attr(path2, "d", "M6.24 23.488c-0.032 0.064-0.16 0.096-0.288\r\n        0.064-0.128-0.064-0.192-0.16-0.128-0.256 0.032-0.096 0.16-0.096\r\n        0.288-0.064 0.128 0.064 0.192 0.16 0.128 0.256v0z");
    			attr(path2, "class", "svelte-iuuxyk");
    			add_location(path2, file$1, 486, 6, 15789);
    			attr(path3, "d", "M6.912 24.192c-0.064 0.064-0.224\r\n        0.032-0.32-0.064s-0.128-0.256-0.032-0.32c0.064-0.064 0.224-0.032 0.32\r\n        0.064s0.096 0.256 0.032 0.32v0z");
    			attr(path3, "class", "svelte-iuuxyk");
    			add_location(path3, file$1, 490, 6, 15993);
    			attr(path4, "d", "M7.52 25.12c-0.096 0.064-0.256 0-0.352-0.128s-0.096-0.32\r\n        0-0.384c0.096-0.064 0.256 0 0.352 0.128 0.128 0.128 0.128 0.32 0\r\n        0.384v0z");
    			attr(path4, "class", "svelte-iuuxyk");
    			add_location(path4, file$1, 494, 6, 16175);
    			attr(path5, "d", "M8.384 26.016c-0.096 0.096-0.288\r\n        0.064-0.416-0.064s-0.192-0.32-0.096-0.416c0.096-0.096 0.288-0.064 0.416\r\n        0.064 0.16 0.128 0.192 0.32 0.096 0.416v0z");
    			attr(path5, "class", "svelte-iuuxyk");
    			add_location(path5, file$1, 498, 6, 16353);
    			attr(path6, "d", "M9.6 26.528c-0.032 0.128-0.224 0.192-0.384\r\n        0.128-0.192-0.064-0.288-0.192-0.256-0.32s0.224-0.192 0.416-0.128c0.128\r\n        0.032 0.256 0.192 0.224 0.32v0z");
    			attr(path6, "class", "svelte-iuuxyk");
    			add_location(path6, file$1, 502, 6, 16548);
    			attr(path7, "d", "M10.912 26.624c0 0.128-0.16 0.256-0.352\r\n        0.256s-0.352-0.096-0.352-0.224c0-0.128 0.16-0.256 0.352-0.256\r\n        0.192-0.032 0.352 0.096 0.352 0.224v0z");
    			attr(path7, "class", "svelte-iuuxyk");
    			add_location(path7, file$1, 506, 6, 16741);
    			attr(path8, "d", "M12.128 26.4c0.032 0.128-0.096 0.256-0.288\r\n        0.288s-0.352-0.032-0.384-0.16c-0.032-0.128 0.096-0.256 0.288-0.288s0.352\r\n        0.032 0.384 0.16v0z");
    			attr(path8, "class", "svelte-iuuxyk");
    			add_location(path8, file$1, 510, 6, 16929);
    			attr(symbol1, "id", "icon-github");
    			attr(symbol1, "viewBox", "0 0 32 32");
    			attr(symbol1, "class", "svelte-iuuxyk");
    			add_location(symbol1, file$1, 469, 4, 14734);
    			attr(title2, "class", "svelte-iuuxyk");
    			add_location(title2, file$1, 517, 6, 17182);
    			attr(path9, "d", "M16 31.68c-0.352\r\n        0-0.672-0.064-1.024-0.16-0.8-0.256-1.44-0.832-1.824-1.6l-6.784-13.632c-1.664-3.36-1.568-7.328\r\n        0.32-10.592 1.856-3.2 4.992-5.152 8.608-5.376h1.376c3.648 0.224 6.752\r\n        2.176 8.608 5.376 1.888 3.264 2.016 7.232 0.352 10.592l-6.816\r\n        13.664c-0.288 0.608-0.8 1.12-1.408 1.408-0.448 0.224-0.928 0.32-1.408\r\n        0.32zM15.392 2.368c-2.88 0.192-5.408 1.76-6.912 4.352-1.536 2.688-1.632\r\n        5.92-0.288 8.672l6.816 13.632c0.128 0.256 0.352 0.448 0.64 0.544s0.576\r\n        0.064 0.832-0.064c0.224-0.096 0.384-0.288\r\n        0.48-0.48l6.816-13.664c1.376-2.752\r\n        1.248-5.984-0.288-8.672-1.472-2.56-4-4.128-6.88-4.32h-1.216zM16\r\n        17.888c-3.264 0-5.92-2.656-5.92-5.92 0-3.232 2.656-5.888 5.92-5.888s5.92\r\n        2.656 5.92 5.92c0 3.264-2.656 5.888-5.92 5.888zM16 8.128c-2.144 0-3.872\r\n        1.728-3.872 3.872s1.728 3.872 3.872 3.872 3.872-1.728\r\n        3.872-3.872c0-2.144-1.76-3.872-3.872-3.872z");
    			attr(path9, "class", "svelte-iuuxyk");
    			add_location(path9, file$1, 518, 6, 17213);
    			attr(path10, "d", "M16 32c-0.384\r\n        0-0.736-0.064-1.12-0.192-0.864-0.288-1.568-0.928-1.984-1.728l-6.784-13.664c-1.728-3.456-1.6-7.52\r\n        0.352-10.912 1.888-3.264 5.088-5.28 8.832-5.504h1.376c3.744 0.224 6.976\r\n        2.24 8.864 5.536 1.952 3.36 2.080 7.424 0.352 10.912l-6.784 13.632c-0.32\r\n        0.672-0.896 1.216-1.568 1.568-0.48 0.224-0.992 0.352-1.536 0.352zM15.36\r\n        0.64h-0.064c-3.488 0.224-6.56 2.112-8.32 5.216-1.824 3.168-1.952\r\n        7.040-0.32 10.304l6.816 13.632c0.32 0.672 0.928 1.184 1.632 1.44s1.472\r\n        0.192 2.176-0.16c0.544-0.288 1.024-0.736\r\n        1.28-1.28l6.816-13.632c1.632-3.264\r\n        1.504-7.136-0.32-10.304-1.824-3.104-4.864-5.024-8.384-5.216h-1.312zM16\r\n        29.952c-0.16\r\n        0-0.32-0.032-0.448-0.064-0.352-0.128-0.64-0.384-0.8-0.704l-6.816-13.664c-1.408-2.848-1.312-6.176\r\n        0.288-8.96 1.536-2.656 4.16-4.32 7.168-4.512h1.216c3.040 0.192 5.632\r\n        1.824 7.2 4.512 1.6 2.752 1.696 6.112 0.288 8.96l-6.848 13.632c-0.128\r\n        0.288-0.352 0.512-0.64 0.64-0.192 0.096-0.384 0.16-0.608 0.16zM15.424\r\n        2.688c-2.784 0.192-5.216 1.696-6.656 4.192-1.504 2.592-1.6 5.696-0.256\r\n        8.352l6.816 13.632c0.096 0.192 0.256 0.32 0.448 0.384s0.416 0.064\r\n        0.608-0.032c0.16-0.064 0.288-0.192 0.352-0.352l6.816-13.664c1.312-2.656\r\n        1.216-5.792-0.288-8.352-1.472-2.464-3.904-4-6.688-4.16h-1.152zM16\r\n        18.208c-3.424 0-6.24-2.784-6.24-6.24 0-3.424 2.816-6.208 6.24-6.208s6.24\r\n        2.784 6.24 6.24c0 3.424-2.816 6.208-6.24 6.208zM16 6.4c-3.072 0-5.6\r\n        2.496-5.6 5.6 0 3.072 2.528 5.6 5.6 5.6s5.6-2.496\r\n        5.6-5.6c0-3.104-2.528-5.6-5.6-5.6zM16 16.16c-2.304\r\n        0-4.16-1.888-4.16-4.16s1.888-4.16 4.16-4.16c2.304 0 4.16 1.888 4.16\r\n        4.16s-1.856 4.16-4.16 4.16zM16 8.448c-1.952 0-3.552 1.6-3.552 3.552s1.6\r\n        3.552 3.552 3.552c1.952 0 3.552-1.6 3.552-3.552s-1.6-3.552-3.552-3.552z");
    			attr(path10, "class", "svelte-iuuxyk");
    			add_location(path10, file$1, 533, 6, 18199);
    			attr(symbol2, "id", "icon-location");
    			attr(symbol2, "viewBox", "0 0 32 32");
    			attr(symbol2, "class", "svelte-iuuxyk");
    			add_location(symbol2, file$1, 516, 4, 17127);
    			attr(title3, "class", "svelte-iuuxyk");
    			add_location(title3, file$1, 563, 6, 20182);
    			attr(path11, "d", "M19 6h5v-6h-5c-3.86 0-7 3.14-7\r\n        7v3h-4v6h4v16h6v-16h5l1-6h-6v-3c0-0.542 0.458-1 1-1z");
    			attr(path11, "class", "svelte-iuuxyk");
    			add_location(path11, file$1, 564, 6, 20213);
    			attr(symbol3, "id", "icon-facebook");
    			attr(symbol3, "viewBox", "0 0 32 32");
    			attr(symbol3, "class", "svelte-iuuxyk");
    			add_location(symbol3, file$1, 562, 4, 20127);
    			attr(title4, "class", "svelte-iuuxyk");
    			add_location(title4, file$1, 570, 6, 20406);
    			attr(path12, "d", "M16 2.881c4.275 0 4.781 0.019 6.462 0.094 1.563 0.069 2.406 0.331\r\n        2.969 0.55 0.744 0.288 1.281 0.638 1.837 1.194 0.563 0.563 0.906 1.094\r\n        1.2 1.838 0.219 0.563 0.481 1.412 0.55 2.969 0.075 1.688 0.094 2.194\r\n        0.094 6.463s-0.019 4.781-0.094 6.463c-0.069 1.563-0.331 2.406-0.55\r\n        2.969-0.288 0.744-0.637 1.281-1.194 1.837-0.563 0.563-1.094 0.906-1.837\r\n        1.2-0.563 0.219-1.413 0.481-2.969 0.55-1.688 0.075-2.194 0.094-6.463\r\n        0.094s-4.781-0.019-6.463-0.094c-1.563-0.069-2.406-0.331-2.969-0.55-0.744-0.288-1.281-0.637-1.838-1.194-0.563-0.563-0.906-1.094-1.2-1.837-0.219-0.563-0.481-1.413-0.55-2.969-0.075-1.688-0.094-2.194-0.094-6.463s0.019-4.781\r\n        0.094-6.463c0.069-1.563 0.331-2.406 0.55-2.969 0.288-0.744 0.638-1.281\r\n        1.194-1.838 0.563-0.563 1.094-0.906 1.838-1.2 0.563-0.219 1.412-0.481\r\n        2.969-0.55 1.681-0.075 2.188-0.094 6.463-0.094zM16 0c-4.344 0-4.887\r\n        0.019-6.594 0.094-1.7 0.075-2.869 0.35-3.881 0.744-1.056 0.412-1.95\r\n        0.956-2.837 1.85-0.894 0.888-1.438 1.781-1.85 2.831-0.394 1.019-0.669\r\n        2.181-0.744 3.881-0.075 1.713-0.094 2.256-0.094 6.6s0.019 4.887 0.094\r\n        6.594c0.075 1.7 0.35 2.869 0.744 3.881 0.413 1.056 0.956 1.95 1.85 2.837\r\n        0.887 0.887 1.781 1.438 2.831 1.844 1.019 0.394 2.181 0.669 3.881 0.744\r\n        1.706 0.075 2.25 0.094 6.594 0.094s4.888-0.019 6.594-0.094c1.7-0.075\r\n        2.869-0.35 3.881-0.744 1.050-0.406 1.944-0.956 2.831-1.844s1.438-1.781\r\n        1.844-2.831c0.394-1.019 0.669-2.181 0.744-3.881 0.075-1.706 0.094-2.25\r\n        0.094-6.594s-0.019-4.887-0.094-6.594c-0.075-1.7-0.35-2.869-0.744-3.881-0.394-1.063-0.938-1.956-1.831-2.844-0.887-0.887-1.781-1.438-2.831-1.844-1.019-0.394-2.181-0.669-3.881-0.744-1.712-0.081-2.256-0.1-6.6-0.1v0z");
    			attr(path12, "class", "svelte-iuuxyk");
    			add_location(path12, file$1, 571, 6, 20438);
    			attr(path13, "d", "M16 7.781c-4.537 0-8.219 3.681-8.219 8.219s3.681 8.219 8.219 8.219\r\n        8.219-3.681 8.219-8.219c0-4.537-3.681-8.219-8.219-8.219zM16\r\n        21.331c-2.944 0-5.331-2.387-5.331-5.331s2.387-5.331 5.331-5.331c2.944 0\r\n        5.331 2.387 5.331 5.331s-2.387 5.331-5.331 5.331z");
    			attr(path13, "class", "svelte-iuuxyk");
    			add_location(path13, file$1, 591, 6, 22248);
    			attr(path14, "d", "M26.462 7.456c0 1.060-0.859 1.919-1.919\r\n        1.919s-1.919-0.859-1.919-1.919c0-1.060 0.859-1.919 1.919-1.919s1.919\r\n        0.859 1.919 1.919z");
    			attr(path14, "class", "svelte-iuuxyk");
    			add_location(path14, file$1, 596, 6, 22553);
    			attr(symbol4, "id", "icon-instagram");
    			attr(symbol4, "viewBox", "0 0 32 32");
    			attr(symbol4, "class", "svelte-iuuxyk");
    			add_location(symbol4, file$1, 569, 4, 20350);
    			attr(title5, "class", "svelte-iuuxyk");
    			add_location(title5, file$1, 603, 6, 22797);
    			attr(path15, "d", "M32 7.075c-1.175 0.525-2.444 0.875-3.769 1.031 1.356-0.813 2.394-2.1\r\n        2.887-3.631-1.269 0.75-2.675 1.3-4.169\r\n        1.594-1.2-1.275-2.906-2.069-4.794-2.069-3.625 0-6.563 2.938-6.563 6.563\r\n        0 0.512 0.056 1.012 0.169\r\n        1.494-5.456-0.275-10.294-2.888-13.531-6.862-0.563 0.969-0.887 2.1-0.887\r\n        3.3 0 2.275 1.156 4.287 2.919 5.463-1.075-0.031-2.087-0.331-2.975-0.819\r\n        0 0.025 0 0.056 0 0.081 0 3.181 2.263 5.838 5.269 6.437-0.55 0.15-1.131\r\n        0.231-1.731 0.231-0.425 0-0.831-0.044-1.237-0.119 0.838 2.606 3.263\r\n        4.506 6.131 4.563-2.25 1.762-5.075 2.813-8.156 2.813-0.531\r\n        0-1.050-0.031-1.569-0.094 2.913 1.869 6.362 2.95 10.069 2.95 12.075 0\r\n        18.681-10.006 18.681-18.681 0-0.287-0.006-0.569-0.019-0.85 1.281-0.919\r\n        2.394-2.075 3.275-3.394z");
    			attr(path15, "class", "svelte-iuuxyk");
    			add_location(path15, file$1, 604, 6, 22827);
    			attr(symbol5, "id", "icon-twitter");
    			attr(symbol5, "viewBox", "0 0 32 32");
    			attr(symbol5, "class", "svelte-iuuxyk");
    			add_location(symbol5, file$1, 602, 4, 22743);
    			attr(title6, "class", "svelte-iuuxyk");
    			add_location(title6, file$1, 620, 6, 23739);
    			attr(path16, "d", "M9.281 6.412c0.944 0 1.794 0.081 2.569 0.25 0.775 0.162 1.431 0.438\r\n        1.988 0.813 0.55 0.375 0.975 0.875 1.287 1.5 0.3 0.619 0.45 1.394 0.45\r\n        2.313 0 0.994-0.225 1.819-0.675 2.481-0.456 0.662-1.119 1.2-2.006 1.625\r\n        1.213 0.35 2.106 0.962 2.706 1.831 0.6 0.875 0.887 1.925 0.887 3.163 0\r\n        1-0.194 1.856-0.575 2.581-0.387 0.731-0.912 1.325-1.556 1.781-0.65\r\n        0.462-1.4 0.8-2.237 1.019-0.831 0.219-1.688 0.331-2.575\r\n        0.331h-9.544v-19.688h9.281zM8.719 14.363c0.769 0 1.406-0.181 1.906-0.55\r\n        0.5-0.363 0.738-0.963 0.738-1.787\r\n        0-0.456-0.081-0.838-0.244-1.131-0.169-0.294-0.387-0.525-0.669-0.688-0.275-0.169-0.588-0.281-0.956-0.344-0.356-0.069-0.731-0.1-1.113-0.1h-4.050v4.6h4.388zM8.956\r\n        22.744c0.425 0 0.831-0.038 1.213-0.125 0.387-0.087 0.731-0.219\r\n        1.019-0.419 0.287-0.194 0.531-0.45 0.706-0.788 0.175-0.331 0.256-0.756\r\n        0.256-1.275\r\n        0-1.012-0.287-1.738-0.856-2.175-0.569-0.431-1.325-0.644-2.262-0.644h-4.7v5.419h4.625z");
    			attr(path16, "class", "svelte-iuuxyk");
    			add_location(path16, file$1, 621, 6, 23769);
    			attr(path17, "d", "M22.663 22.675c0.587 0.575 1.431 0.863 2.531 0.863 0.788 0 1.475-0.2\r\n        2.044-0.6s0.913-0.825 1.044-1.262h3.45c-0.556 1.719-1.394 2.938-2.544\r\n        3.675-1.131 0.738-2.519 1.113-4.125 1.113-1.125\r\n        0-2.131-0.181-3.038-0.538-0.906-0.363-1.663-0.869-2.3-1.531-0.619-0.663-1.106-1.45-1.45-2.375-0.337-0.919-0.512-1.938-0.512-3.038\r\n        0-1.069 0.175-2.063 0.525-2.981 0.356-0.925 0.844-1.719\r\n        1.494-2.387s1.413-1.2 2.313-1.588c0.894-0.387 1.881-0.581 2.975-0.581\r\n        1.206 0 2.262 0.231 3.169 0.706 0.9 0.469 1.644 1.1 2.225 1.887s0.994\r\n        1.694 1.25 2.706c0.256 1.012 0.344 2.069 0.275 3.175h-10.294c0 1.119\r\n        0.375 2.188 0.969 2.756zM27.156\r\n        15.188c-0.462-0.512-1.256-0.794-2.212-0.794-0.625 0-1.144 0.106-1.556\r\n        0.319-0.406 0.213-0.738 0.475-0.994 0.787-0.25 0.313-0.425 0.65-0.525\r\n        1.006-0.1 0.344-0.163 0.663-0.181\r\n        0.938h6.375c-0.094-1-0.438-1.738-0.906-2.256z");
    			attr(path17, "class", "svelte-iuuxyk");
    			add_location(path17, file$1, 635, 6, 24809);
    			attr(path18, "d", "M20.887 8h7.981v1.944h-7.981v-1.944z");
    			attr(path18, "class", "svelte-iuuxyk");
    			add_location(path18, file$1, 649, 6, 25780);
    			attr(symbol6, "id", "icon-behance");
    			attr(symbol6, "viewBox", "0 0 32 32");
    			attr(symbol6, "class", "svelte-iuuxyk");
    			add_location(symbol6, file$1, 619, 4, 23685);
    			attr(title7, "class", "svelte-iuuxyk");
    			add_location(title7, file$1, 653, 6, 25903);
    			attr(path19, "d", "M17.984 11.456c-0.704 0.704-0.704 1.856 0 2.56 2.112 2.112 2.112\r\n        5.568 0 7.68l-5.12 5.12c-2.048 2.048-5.632 2.048-7.68\r\n        0-1.024-1.024-1.6-2.4-1.6-3.84s0.576-2.816 1.6-3.84c0.704-0.704\r\n        0.704-1.856 0-2.56s-1.856-0.704-2.56 0c-1.696 1.696-2.624 3.968-2.624\r\n        6.368 0 2.432 0.928 4.672 2.656 6.4 1.696 1.696 3.968 2.656 6.4\r\n        2.656s4.672-0.928 6.4-2.656l5.12-5.12c3.52-3.52 3.52-9.248\r\n        0-12.8-0.736-0.672-1.888-0.672-2.592 0.032z");
    			attr(path19, "class", "svelte-iuuxyk");
    			add_location(path19, file$1, 654, 6, 25930);
    			attr(path20, "d", "M29.344 2.656c-1.696-1.728-3.968-2.656-6.4-2.656s-4.672 0.928-6.4\r\n        2.656l-5.12 5.12c-3.52 3.52-3.52 9.248 0 12.8 0.352 0.352 0.8 0.544 1.28\r\n        0.544s0.928-0.192 1.28-0.544c0.704-0.704 0.704-1.856\r\n        0-2.56-2.112-2.112-2.112-5.568 0-7.68l5.12-5.12c2.048-2.048 5.632-2.048\r\n        7.68 0 1.024 1.024 1.6 2.4 1.6 3.84s-0.576 2.816-1.6 3.84c-0.704\r\n        0.704-0.704 1.856 0 2.56s1.856 0.704 2.56 0c1.696-1.696 2.656-3.968\r\n        2.656-6.4s-0.928-4.704-2.656-6.4z");
    			attr(path20, "class", "svelte-iuuxyk");
    			add_location(path20, file$1, 662, 6, 26433);
    			attr(symbol7, "id", "icon-link");
    			attr(symbol7, "viewBox", "0 0 32 32");
    			attr(symbol7, "class", "svelte-iuuxyk");
    			add_location(symbol7, file$1, 652, 4, 25852);
    			attr(path21, "fill", "currentColor");
    			attr(path21, "d", "M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9\r\n        480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4\r\n        416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96\r\n        102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1\r\n        243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9\r\n        54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0\r\n        79.7 44.3 79.7 101.9V416z");
    			attr(path21, "class", "svelte-iuuxyk");
    			add_location(path21, file$1, 673, 6, 27011);
    			attr(svg1, "id", "linkedin");
    			attr(svg1, "viewBox", "0 0 448 512");
    			attr(svg1, "class", "svelte-iuuxyk");
    			add_location(svg1, file$1, 672, 4, 26962);
    			attr(defs, "class", "svelte-iuuxyk");
    			add_location(defs, file$1, 442, 2, 13005);
    			attr(svg2, "hidden", "hidden");
    			attr(svg2, "class", "svelte-iuuxyk");
    			add_location(svg2, file$1, 441, 0, 12980);

    			dispose = [
    				listen(button0, "click", db_content.useEsp),
    				listen(button1, "click", db_content.useEng)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div25, anchor);
    			append(div25, div24);
    			append(div24, div0);
    			append(div0, img);
    			append(div24, t0);
    			append(div24, div19);
    			append(div19, div1);
    			append(div1, t1);
    			append(div19, t2);
    			append(div19, div2);
    			append(div2, t3);
    			append(div2, t4);
    			append(div2, t5);
    			append(div2, t6);
    			append(div2, strong);
    			append(strong, t7);
    			append(div19, t8);
    			append(div19, div3);
    			append(div3, span0);
    			append(span0, svg0);
    			append(svg0, use);
    			append(div3, t9);
    			append(div3, span1);
    			append(span1, t10);
    			append(span1, t11);
    			append(span1, t12);
    			append(div19, t13);
    			append(div19, div16);
    			append(div16, div6);
    			append(div6, div4);
    			append(div6, t15);
    			append(div6, div5);
    			append(div16, t17);
    			append(div16, div9);
    			append(div9, div7);
    			append(div9, t19);
    			append(div9, div8);
    			append(div16, t21);
    			append(div16, div12);
    			append(div12, div10);
    			append(div12, t23);
    			append(div12, div11);
    			append(div16, t25);
    			append(div16, div15);
    			append(div15, div13);
    			append(div15, t27);
    			append(div15, div14);
    			append(div19, t29);
    			append(div19, div17);

    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].m(div17, null);
    			}

    			append(div19, t30);
    			append(div19, div18);
    			append(div18, button0);
    			append(div18, t32);
    			append(div18, button1);
    			append(div24, t34);
    			append(div24, div23);
    			append(div23, form);
    			append(form, div20);
    			append(div20, textarea);
    			append(form, t35);
    			append(form, div21);
    			append(div21, button2);
    			append(div21, t37);
    			append(div21, button3);
    			append(div23, t39);
    			append(div23, div22);
    			insert(target, t40, anchor);
    			insert(target, i, anchor);
    			insert(target, t41, anchor);
    			insert(target, svg2, anchor);
    			append(svg2, defs);
    			append(defs, symbol0);
    			append(symbol0, title0);
    			append(title0, t42);
    			append(symbol0, path0);
    			append(defs, symbol1);
    			append(symbol1, title1);
    			append(title1, t43);
    			append(symbol1, path1);
    			append(symbol1, path2);
    			append(symbol1, path3);
    			append(symbol1, path4);
    			append(symbol1, path5);
    			append(symbol1, path6);
    			append(symbol1, path7);
    			append(symbol1, path8);
    			append(defs, symbol2);
    			append(symbol2, title2);
    			append(title2, t44);
    			append(symbol2, path9);
    			append(symbol2, path10);
    			append(defs, symbol3);
    			append(symbol3, title3);
    			append(title3, t45);
    			append(symbol3, path11);
    			append(defs, symbol4);
    			append(symbol4, title4);
    			append(title4, t46);
    			append(symbol4, path12);
    			append(symbol4, path13);
    			append(symbol4, path14);
    			append(defs, symbol5);
    			append(symbol5, title5);
    			append(title5, t47);
    			append(symbol5, path15);
    			append(defs, symbol6);
    			append(symbol6, title6);
    			append(title6, t48);
    			append(symbol6, path16);
    			append(symbol6, path17);
    			append(symbol6, path18);
    			append(defs, symbol7);
    			append(symbol7, title7);
    			append(title7, t49);
    			append(symbol7, path19);
    			append(symbol7, path20);
    			append(defs, svg1);
    			append(svg1, path21);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$db_content) && t3_value !== (t3_value = ctx.$db_content.main.occupation + "")) {
    				set_data(t3, t3_value);
    			}

    			if ((changed.$db_content) && t5_value !== (t5_value = ctx.$db_content.main.word_at + "")) {
    				set_data(t5, t5_value);
    			}

    			if ((changed.$db_content) && t7_value !== (t7_value = ctx.$db_content.main.work_at + "")) {
    				set_data(t7, t7_value);
    			}

    			if (changed.social) {
    				each_value = ctx.social;

    				for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i_1);

    					if (each_blocks[i_1]) {
    						each_blocks[i_1].p(changed, child_ctx);
    					} else {
    						each_blocks[i_1] = create_each_block$1(child_ctx);
    						each_blocks[i_1].c();
    						each_blocks[i_1].m(div17, null);
    					}
    				}

    				for (; i_1 < each_blocks.length; i_1 += 1) {
    					each_blocks[i_1].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div25);
    			}

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(t40);
    				detach(i);
    				detach(t41);
    				detach(svg2);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $db_content;

    	validate_store(db_content, 'db_content');
    	component_subscribe($$self, db_content, $$value => { $db_content = $$value; $$invalidate('$db_content', $db_content); });

    	const {
        name,
        occupation,
        bio,
        address,
        email,
        phone,
        image,
        social,
        work_at,
        word_at
      } = content_app.main;
      const { city, state, country, zip, street } = address;

      const profilepic = "images/" + image;

      // let messageBox = document.querySelector(".js-message");
      // let btn = document.querySelector(".js-message-btn");
      // let card = document.querySelector(".js-profile-card");
      // let closeBtn = document.querySelectorAll(".js-message-close");

      // btn.addEventListener("click", function(e) {
      //   e.preventDefault();
      //   card.classList.add("active");
      // });

      // closeBtn.forEach(function(element, index) {
      //   console.log(element);
      //   element.addEventListener("click", function(e) {
      //     e.preventDefault();
      //     card.classList.remove("active");
      //   });
      // });

    	return {
    		name,
    		social,
    		city,
    		country,
    		profilepic,
    		$db_content
    	};
    }

    class Presentation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src\App.svelte generated by Svelte v3.9.1 */

    const file$2 = "src\\App.svelte";

    function create_fragment$2(ctx) {
    	var div, t, current;

    	var presentation = new Presentation({ $$inline: true });

    	var resume = new Resume({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			presentation.$$.fragment.c();
    			t = space();
    			resume.$$.fragment.c();
    			add_location(div, file$2, 12, 0, 472);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(presentation, div, null);
    			append(div, t);
    			mount_component(resume, div, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(presentation.$$.fragment, local);

    			transition_in(resume.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(presentation.$$.fragment, local);
    			transition_out(resume.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(presentation);

    			destroy_component(resume);
    		}
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, []);
    	}
    }

    // import './global.scss'

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
