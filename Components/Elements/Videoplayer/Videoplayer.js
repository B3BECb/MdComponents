Builder
	.RegisterHtmlTemplate("Components/Elements/Videoplayer/VideoplayerTemplate.html",
		(link) =>
		{
			Videoplayer.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define('video-player', Videoplayer);
		});

class Videoplayer extends HTMLElement
{
	constructor()
	{
		super();

		this.InsertTemplate();
	}

	InsertTemplate()
	{
		var content = Videoplayer.Link.import.querySelector('template#main').content;

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));
	}

	Configure(configuration)
	{

	}

	static Types()
	{
		return {
			Image: 0,
			Video: 1.
		};
	}
}

/**
 * Конфигурация видеоплеера
 * Параметры конструктора:
 * source - источник
 * playerType - тип видеоплеера
 * layers - настройки слоёв плеера
 * name - имя плеера
 * triggers - массив триггеров
 */
class VideoplayerConfiguration
{
	constructor(source, playerType, layers, name = "", triggers = [])
	{
		this.Triggers = triggers;
		this.Source = source;
		this.PlayerType = playerType;
		this.Name = name;
		this.Layers = layers;
	}
}

/**
 * Триггер видеоплеера
 * Параметры конструктора:
 * triggerName - отображаемое имя триггера
 * triggerId - идентификатор триггера
 */
class VideoplayerTrigger
{
	constructor(triggerName, triggerId)
	{
		this.TriggerName = triggerName;
		this.TriggerId = triggerId;
	}
}

/**
 * Настройки слоёв плеера
 * Праметры конструктора:
 * settingsLayer - настройки слоя настроек
 * recognitionLayer - настройки слоя распознавания
 */
class VideoplayerLayers
{
	constructor(settingsLayer = null, recognitionLayer = null)
	{
		this.SettingsLayer = settingsLayer;
		this.RecognitionLayer = recognitionLayer;
	}
}