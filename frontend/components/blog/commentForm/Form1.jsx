"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { publicContentAPI } from "@/lib/api/public-content";

export default function Form1({
	contentId,
	parentId = null,
	onSuccess,
	language = "pt",
	isDark = false,
}) {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		comment: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState(null);

	const translations = {
		name: { pt: "Nome", en: "Name" },
		email: { pt: "Email", en: "Email" },
		comment: { pt: "Comentário", en: "Comment" },
		namePlaceholder: { pt: "Digite seu nome", en: "Enter your name" },
		emailPlaceholder: { pt: "Digite seu email", en: "Enter your email" },
		commentPlaceholder: {
			pt: "Digite seu comentário",
			en: "Enter your comment",
		},
		send: { pt: "Enviar comentário", en: "Send comment" },
		sending: { pt: "Enviando...", en: "Sending..." },
		required: { pt: "* - campos obrigatórios", en: "* - required fields" },
		success: {
			pt: "Comentário enviado! Aguardando aprovação.",
			en: "Comment sent! Waiting for approval.",
		},
		error: {
			pt: "Erro ao enviar comentário.",
			en: "Error sending comment.",
		},
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setSubmitting(true);
		setMessage(null);

		try {
			await publicContentAPI.postComment({
				contentId: contentId,
				text: formData.comment,
				authorName: formData.name,
				authorEmail: formData.email,
				parentId: parentId,
			});

			toast.success(translations.success[language]);
			setFormData({ name: "", email: "", comment: "" });
			if (onSuccess) {
				setTimeout(() => onSuccess(), 1000);
			}
		} catch (error) {
			toast.error(translations.error[language]);
		} finally {
			setSubmitting(false);
		}
	};

	const inputClass = isDark
		? "input-sm underline form-control bg-dark-1 text-white border-gray"
		: "input-sm underline form-control";

	return (
		<form className="form" onSubmit={handleSubmit}>
			<>
				<div className="row mb-30 mb-md-20">
					<div className="col-md-6 mb-md-20">
						{/* Name */}
						<label
							htmlFor="name"
							className={isDark ? "text-white" : ""}
						>
							{translations.name[language]} *
						</label>
						<input
							type="text"
							name="name"
							id="name"
							className={inputClass}
							placeholder={translations.namePlaceholder[language]}
							maxLength={100}
							value={formData.name}
							onChange={e =>
								setFormData({
									...formData,
									name: e.target.value,
								})
							}
							required
							aria-required="true"
						/>
					</div>
					<div className="col-md-6">
						{/* Email */}
						<label
							htmlFor="email"
							className={isDark ? "text-white" : ""}
						>
							{translations.email[language]} *
						</label>
						<input
							type="email"
							name="email"
							id="email"
							className={inputClass}
							placeholder={
								translations.emailPlaceholder[language]
							}
							maxLength={100}
							value={formData.email}
							onChange={e =>
								setFormData({
									...formData,
									email: e.target.value,
								})
							}
							required
							aria-required="true"
						/>
					</div>
				</div>
				{/* Comment */}
				<div className="mb-30 mb-md-20">
					<label
						htmlFor="comment"
						className={isDark ? "text-white" : ""}
					>
						{translations.comment[language]} *
					</label>
					<textarea
						name="comment"
						id="comment"
						className={inputClass}
						rows={6}
						placeholder={translations.commentPlaceholder[language]}
						maxLength={2000}
						value={formData.comment}
						onChange={e =>
							setFormData({
								...formData,
								comment: e.target.value,
							})
						}
						required
					/>
				</div>

				{/* Send Button */}
				<button
					type="submit"
					className="btn btn-mod btn-medium btn-circle btn-hover-anim"
					disabled={submitting}
				>
					<span>
						{submitting
							? translations.sending[language]
							: translations.send[language]}
					</span>
				</button>
				{/* Inform Tip */}
				<div
					className={`form-tip form-tip-2 ${
						isDark ? "bg-dark-2 text-gray" : "bg-gray-light-1"
					} round mt-30 p-3`}
				>
					{translations.required[language]}
				</div>
			</>
		</form>
	);
}
