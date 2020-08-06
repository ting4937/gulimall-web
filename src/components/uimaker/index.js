import uiForm from './ui-form.vue';
import uiTable from './ui-table.vue';
import uiText from './ui-text.vue';
import uiSelect from './ui-select.vue';
import uiOption from './ui-option.vue';
import uiTextarea from './ui-textarea.vue';
import uiDate from './ui-date.vue';
import uiNumber from './ui-number.vue';
import uiTemplate from './ui-template.vue';
import uiButton from './ui-button.vue';
import uiSwitch from './ui-switch.vue';
import uiHidden from './ui-hidden.vue';
import uiAttachment from './ui-attachment.vue';
import uiImage from './ui-image.vue';
import uiCascade from './ui-cascade.vue';
import uiTime from './ui-time.vue';
import uiColor from './ui-color.vue';
import uiRichText from './ui-richtext.vue';

const components = [
	uiForm,
	uiTable,
	uiText,
	uiSelect,
	uiOption,
	uiTextarea,
	uiDate,
	uiNumber,
	uiTemplate,
	uiButton,
	uiSwitch,
	uiHidden,
	uiAttachment,
	uiImage,
	uiCascade,
	uiTime,
	uiColor,
	uiRichText
];

const install = function(Vue, opts = {}) {
	components.forEach(component => {
		if(opts[component.name]){
			for(var name in opts[component.name]){
				component.props[name].default=opts[component.name][name];
			}
		}
		Vue.component(component.name, component);
	});
};

export default {
	version: '2.0.0',
	install:install,
}