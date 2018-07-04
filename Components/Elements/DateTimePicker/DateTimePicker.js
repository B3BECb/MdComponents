Builder
.RegisterHtmlTemplate("Components/Elements/DateTimePicker.DateTimePickerTemplate.html",
	(link) =>
	{
		MaterialComboBox.Link = document.querySelector('#' + link.ReferenceName);

		window.customElements.define('material-date-time-picker', MaterialDateTimePicker);
	});

/**
 * Компонент выбора даты и времени.
 */
class MaterialDateTimePicker
	extends HTMLElement
{
	constructor()
	{
		super();

		this.InsertTemplate();

		this._configuration = null;
	}

	InsertTemplate()
	{
		var content = Videoplayer.Link.import.querySelector('template#main').content;

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));
	}

	Configure(configuration = new DateTimePickerConfiguration())
	{
		this._configuration = configuration;
	}

	static Types()
	{
		return {
			DateAndTime: 0,
			Date:        1,
			Time:        2,
		};
	}
}

class DateTimePickerConfiguration
{
	constructor()
	{
		this.Today = new Date();

		let year = (this.Today).getFullYear();
		this.StartDate = new Date(year, 7, 4);
		year += 2;
		this.EndDate = new Date(year, 1, 1);

		this.Type = MaterialDateTimePicker.Types().DateAndTime;
	}
}