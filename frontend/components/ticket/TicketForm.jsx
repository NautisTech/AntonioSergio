"use client";
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { pageTranslations } from "@/data/aesContent";
import { useTicketTypes, useSubmitTicket, TicketPriority } from "@/lib/api/public-support";

export default function TicketForm() {
	const { language } = useLanguage();
	const { theme } = useTheme();
	const t = pageTranslations.ticket.form;
	const isDark = theme === "dark";

	// Fetch ticket types from API
	const { data: ticketTypes, loading: typesLoading, error: typesError } = useTicketTypes();
	const { submitTicket, loading: submitting, error: submitError, response } = useSubmitTicket();

	// Form state
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phone: "",
		title: "",
		description: "",
		ticketTypeId: "",
		priority: "low",
		location: "",
	});

	// Equipment state - array of equipment objects
	const [equipments, setEquipments] = useState([]);
	const [currentEquipment, setCurrentEquipment] = useState({
		serialNumber: "",
		description: "",
	});

	// Validation errors
	const [errors, setErrors] = useState({});

	// Success state
	const [showSuccess, setShowSuccess] = useState(false);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value,
		}));
		// Clear error for this field
		if (errors[name]) {
			setErrors(prev => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const handleEquipmentChange = (e) => {
		const { name, value } = e.target;
		setCurrentEquipment(prev => ({
			...prev,
			[name]: value,
		}));
	};

	const addEquipment = () => {
		if (currentEquipment.serialNumber || currentEquipment.description) {
			setEquipments(prev => [...prev, currentEquipment]);
			setCurrentEquipment({ serialNumber: "", description: "" });
		}
	};

	const removeEquipment = (index) => {
		setEquipments(prev => prev.filter((_, i) => i !== index));
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.fullName.trim()) {
			newErrors.fullName = t.validation.required[language];
		}

		if (!formData.title.trim()) {
			newErrors.title = t.validation.required[language];
		}

		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = t.validation.emailInvalid[language];
		}

		if (!formData.ticketTypeId) {
			newErrors.ticketTypeId = t.validation.required[language];
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Build description with contact info
		let fullDescription = formData.description || "";

		if (formData.fullName || formData.email || formData.phone) {
			fullDescription += "\n\n--- Contact Information ---\n";
			if (formData.fullName) fullDescription += `Name: ${formData.fullName}\n`;
			if (formData.email) fullDescription += `Email: ${formData.email}\n`;
			if (formData.phone) fullDescription += `Phone: ${formData.phone}\n`;
		}

		// Build equipment strings (comma-separated)
		const equipmentSerialNumbers = equipments
			.map(eq => eq.serialNumber)
			.filter(Boolean)
			.join(",");
		const equipmentDescriptions = equipments
			.map(eq => eq.description)
			.filter(Boolean)
			.join(",");

		// Prepare ticket data
		const ticketData = {
			ticketTypeId: parseInt(formData.ticketTypeId),
			title: formData.title,
			description: fullDescription,
			priority: formData.priority,
			location: formData.location || undefined,
			equipmentSerialNumber: equipmentSerialNumbers || undefined,
			equipmentDescription: equipmentDescriptions || undefined,
		};

		const result = await submitTicket(ticketData);

		if (result) {
			setShowSuccess(true);
			// Reset form
			setFormData({
				fullName: "",
				email: "",
				phone: "",
				title: "",
				description: "",
				ticketTypeId: "",
				priority: "low",
				location: "",
			});
			setEquipments([]);
		}
	};

	if (showSuccess && response) {
		return (
			<div className="container position-relative">
				<div className="row justify-content-center">
					<div className="col-lg-8">
						<div className={`alert ${isDark ? "alert-success-dark" : "alert-success"} text-center`}>
							<i className="mi-check-circle size-48 mb-20" />
							<h3 className="mb-20">{t.success.title[language]}</h3>
							<p className="mb-30">{t.success.message[language]}</p>
							<div className="row mb-30">
								<div className="col-md-6 mb-20">
									<strong>{t.success.ticketNumber[language]}:</strong>
									<div className="mt-10">
										<code className="fs-5">{response.ticketNumber}</code>
									</div>
								</div>
								<div className="col-md-6 mb-20">
									<strong>{t.success.accessCode[language]}:</strong>
									<div className="mt-10">
										<code className="fs-5">{response.uniqueCode}</code>
									</div>
								</div>
							</div>
							<p className="text-muted mb-30">
								{t.success.instruction[language]}
							</p>
							<button
								onClick={() => setShowSuccess(false)}
								className="btn btn-mod btn-large btn-round btn-hover-anim"
							>
								<span>{language === "pt" ? "Criar Outro Ticket" : "Create Another Ticket"}</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container position-relative">
			<div className="row justify-content-center">
				<div className="col-lg-8">
					{submitError && (
						<div className={`alert ${isDark ? "alert-danger-dark" : "alert-danger"} mb-40`}>
							<strong>{t.error.title[language]}</strong>
							<p className="mb-0">{t.error.message[language]}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="form contact-form">
						{/* Contact Information */}
						<div className="row">
							<div className="col-lg-6">
								<div className="form-group">
									<label htmlFor="fullName">
										{t.fullName.label[language]} *
									</label>
									<input
										type="text"
										name="fullName"
										id="fullName"
										className={`input-lg round form-control ${errors.fullName ? "is-invalid" : ""}`}
										placeholder={t.fullName.placeholder[language]}
										value={formData.fullName}
										onChange={handleInputChange}
										required
									/>
									{errors.fullName && (
										<div className="text-danger mt-10">{errors.fullName}</div>
									)}
								</div>
							</div>
							<div className="col-lg-6">
								<div className="form-group">
									<label htmlFor="email">
										{t.email.label[language]}
									</label>
									<input
										type="email"
										name="email"
										id="email"
										className={`input-lg round form-control ${errors.email ? "is-invalid" : ""}`}
										placeholder={t.email.placeholder[language]}
										value={formData.email}
										onChange={handleInputChange}
									/>
									{errors.email && (
										<div className="text-danger mt-10">{errors.email}</div>
									)}
								</div>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="phone">
								{t.phone.label[language]}
							</label>
							<input
								type="tel"
								name="phone"
								id="phone"
								className="input-lg round form-control"
								placeholder={t.phone.placeholder[language]}
								value={formData.phone}
								onChange={handleInputChange}
							/>
						</div>

						{/* Ticket Information */}
						<div className="form-group">
							<label htmlFor="title">
								{t.title.label[language]} *
							</label>
							<input
								type="text"
								name="title"
								id="title"
								className={`input-lg round form-control ${errors.title ? "is-invalid" : ""}`}
								placeholder={t.title.placeholder[language]}
								value={formData.title}
								onChange={handleInputChange}
								maxLength="200"
								required
							/>
							{errors.title && (
								<div className="text-danger mt-10">{errors.title}</div>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="description">
								{t.description.label[language]}
							</label>
							<textarea
								name="description"
								id="description"
								className="input-lg round form-control"
								style={{ height: 150 }}
								placeholder={t.description.placeholder[language]}
								value={formData.description}
								onChange={handleInputChange}
							/>
						</div>

						<div className="row">
							<div className="col-lg-6">
								<div className="form-group">
									<label htmlFor="ticketTypeId">
										{t.ticketType.label[language]} *
									</label>
									<select
										name="ticketTypeId"
										id="ticketTypeId"
										className={`input-lg round form-control ${errors.ticketTypeId ? "is-invalid" : ""}`}
										value={formData.ticketTypeId}
										onChange={handleInputChange}
										required
									>
										<option value="">
											{t.ticketType.placeholder[language]}
										</option>
										{typesLoading && (
											<option disabled>
												{language === "pt" ? "A carregar..." : "Loading..."}
											</option>
										)}
										{ticketTypes && ticketTypes.map((type) => (
											<option key={type.id} value={type.id}>
												{type.icon && `${type.icon} `}{type.name}
											</option>
										))}
									</select>
									{errors.ticketTypeId && (
										<div className="text-danger mt-10">{errors.ticketTypeId}</div>
									)}
								</div>
							</div>
							<div className="col-lg-6">
								<div className="form-group">
									<label htmlFor="priority">
										{t.priority.label[language]}
									</label>
									<select
										name="priority"
										id="priority"
										className="input-lg round form-control"
										value={formData.priority}
										onChange={handleInputChange}
									>
										<option value="low">{t.priority.options.low[language]}</option>
										<option value="medium">{t.priority.options.medium[language]}</option>
										<option value="high">{t.priority.options.high[language]}</option>
										<option value="urgent">{t.priority.options.urgent[language]}</option>
										<option value="critical">{t.priority.options.critical[language]}</option>
									</select>
								</div>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="location">
								{t.location.label[language]}
							</label>
							<input
								type="text"
								name="location"
								id="location"
								className="input-lg round form-control"
								placeholder={t.location.placeholder[language]}
								value={formData.location}
								onChange={handleInputChange}
								maxLength="200"
							/>
						</div>

						{/* Equipment Section */}
						<div className="form-group">
							<label className="mb-20">
								{t.equipment.label[language]}
							</label>

							{/* Current Equipment Input */}
							<div className="row mb-20">
								<div className="col-lg-5">
									<input
										type="text"
										name="serialNumber"
										className="input-lg round form-control"
										placeholder={t.equipment.serialNumber.placeholder[language]}
										value={currentEquipment.serialNumber}
										onChange={handleEquipmentChange}
									/>
								</div>
								<div className="col-lg-5">
									<input
										type="text"
										name="description"
										className="input-lg round form-control"
										placeholder={t.equipment.description.placeholder[language]}
										value={currentEquipment.description}
										onChange={handleEquipmentChange}
									/>
								</div>
								<div className="col-lg-2">
									<button
										type="button"
										onClick={addEquipment}
										className="btn btn-mod btn-medium btn-round w-100"
										disabled={!currentEquipment.serialNumber && !currentEquipment.description}
									>
										<i className="mi-add" />
									</button>
								</div>
							</div>

							{/* Equipment List */}
							{equipments.length > 0 && (
								<div className="equipment-list">
									{equipments.map((eq, index) => (
										<div key={index} className="equipment-item d-flex justify-content-between align-items-center mb-10 p-15 border rounded">
											<div>
												{eq.serialNumber && (
													<div>
														<strong>{t.equipment.serialNumber.label[language]}:</strong> {eq.serialNumber}
													</div>
												)}
												{eq.description && (
													<div>
														<strong>{t.equipment.description.label[language]}:</strong> {eq.description}
													</div>
												)}
											</div>
											<button
												type="button"
												onClick={() => removeEquipment(index)}
												className="btn btn-sm btn-danger"
											>
												<i className="mi-close" />
											</button>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Submit Button */}
						<div className="pt-20">
							<button
								type="submit"
								className="btn btn-mod btn-large btn-round btn-hover-anim"
								disabled={submitting}
							>
								<span>
									{submitting ? t.submitting[language] : t.submit[language]}
								</span>
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
