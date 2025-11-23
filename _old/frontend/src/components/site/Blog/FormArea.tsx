import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCriarComentario } from "@/lib/api/conteudos-public";
import { toast } from "react-toastify";

const FormArea = ({ conteudoId }: { conteudoId: string | number }) => {
	const { t } = useTranslation("content");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [text, setText] = useState("");
	const { mutate: criarComentario, isPending } = useCriarComentario();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!text || !text.trim()) {
			toast.error(t("form.comment_required") || "Comment is required");
			return;
		}

		criarComentario(
			{
				conteudoId: Number(conteudoId),
				autorNome: name.trim() || undefined,
				autorEmail: email.trim() || undefined,
				conteudo: text.trim(),
			},
			{
				onSuccess: () => {
					setText("");
					setName("");
					setEmail("");
					toast.success(
						t("form.post_success") ||
							"Comment posted successfully! It will appear after moderation."
					);
				},
				onError: error => {
					toast.error(
						t("form.post_error") ||
							"Failed to post comment. Please try again."
					);
				},
			}
		);
	};

	return (
		<>
			<div className="postbox__comment">
				<h3>{t("form.write_comment")}</h3>
				<form onSubmit={handleSubmit}>
					<div className="row">
						<div className="col-xxl-6">
							<div className="postbox__comment-input">
								<input
									type="text"
									placeholder={
										t("form.name_placeholder") ||
										"Your Name (optional)"
									}
									value={name}
									onChange={e => setName(e.target.value)}
									maxLength={100}
								/>
							</div>
						</div>
						<div className="col-xxl-6">
							<div className="postbox__comment-input">
								<input
									type="email"
									placeholder={
										t("form.email_placeholder") ||
										"Your Email (optional)"
									}
									value={email}
									onChange={e => setEmail(e.target.value)}
									maxLength={255}
								/>
							</div>
						</div>
						<div className="col-xxl-12">
							<div className="postbox__comment-input">
								<textarea
									placeholder={
										t("form.comment_placeholder") ||
										"Write your comment..."
									}
									value={text}
									onChange={e => setText(e.target.value)}
									required
									minLength={3}
									maxLength={2000}
								/>
							</div>
						</div>
						<div className="col-xxl-12">
							<div className="postbox__comment-btn">
								<button
									type="submit"
									className="tp-btn"
									disabled={isPending}
								>
									{isPending
										? t("form.posting") || "Posting..."
										: t("form.post_comment") ||
										  "Post Comment"}
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</>
	);
};

export default FormArea;
