Builder
	.RegisterHtmlTemplate("Components/Elements/UserRing/UserRingTemplate.html",
		(link) =>
		{
			MaterialUserRing.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define('material-user-ring', MaterialUserRing);
		});

class MaterialUserRing
	extends HTMLElement
{
	constructor()
	{
		super();

		this._InsertTemplate();
		this.__switchCollapsingHandler = args => this._SwitchCollapsing(args);
	}

	connectedCallback()
	{
		this.IsCollapsed = true;
	}

	_InsertTemplate()
	{
		let content = MaterialUserRing.Link.import.querySelector('template#main').content;

		let shadow = this.attachShadow({mode: "open"});

		shadow.appendChild(content.cloneNode(true));

		this._BindCommands();
	}

	_BindCommands()
	{
		this.shadowRoot
			.querySelector(".userRing .ring")
			.addEventListener("click", args =>
			{
				this._SwitchCollapsing(args);

				this.dispatchEvent(new CustomEvent("ringClicked",
					{
						detail: this,
					}));
			});
	}

	_SwitchCollapsing(args)
	{
		if(args.target !== this && args.target.parentElement !== this)
		{
			this.IsCollapsed = !this.IsCollapsed;

			if(!this.IsCollapsed)
			{
				window.addEventListener("click", this.__switchCollapsingHandler);

				this.dispatchEvent(new CustomEvent("userRingExpanded",
					{
						detail: this,
					}));
			}
			else
			{
				window.removeEventListener("click", this.__switchCollapsingHandler);

				this.dispatchEvent(new CustomEvent("userRingCollapsed",
					{
						detail: this,
					}));
			}
		}
	}

	/**
	 * Возвращает состояние панели.
	 * @return {boolean}
	 */
	get IsCollapsed()
	{
		return this.hasAttribute("collapsed");
	}

	/**
	 * Устанавливает состояние панели.
	 * @param {boolean} value - Состояние;
	 */
	set IsCollapsed(value)
	{
		if(value)
		{
			this.setAttribute("collapsed", "");
		}
		else
		{
			this.removeAttribute("collapsed");
		}
	}
}