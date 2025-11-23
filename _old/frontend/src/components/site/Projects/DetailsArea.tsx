"use client";

import { useState } from "react";
import Pagination from "./Pagination";
import RightSide from "./RightSide";
import Card from "./Card";
import Link from "next/link";

import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, Pagination as SwiperPagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
SwiperCore.use([Navigation, SwiperPagination]);
import FormArea from "./FormArea";
import { useTranslation } from "react-i18next";
import { Loading, Avatar } from "@/components/common";
import {
	useConteudoBySlug,
	useComentarios,
	ComentarioPublico,
} from "@/lib/api/conteudos-public";

const DetailsArea = ({ projetoSlug }: { projetoSlug: string }) => {
	const { data: projeto, isLoading, error } = useConteudoBySlug(projetoSlug);
	const { data: comentarios, isLoading: isLoadingComentarios } =
		useComentarios(projetoSlug);

	const { t } = useTranslation("content");

	return (
		<>
			{isLoading ? (
				<Loading />
			) : (
				<>
					{projeto && (
						<section className="projeto__area pt-120 pb-120">
							<div className="container">
								<div className="row">
									<div className="col-xxl-8 col-xl-8 col-lg-8">
										<div className="postbox__wrapper postbox__details pr-20">
											<div className="postbox__item transition-3 mb-70">
												<div className="postbox__thumb m-img">
													{projeto?.imagem_destaque ||
													(projeto?.anexos &&
														projeto.anexos.length >
															0) ? (
														<Swiper
															slidesPerView={1}
															navigation
															pagination={{
																clickable: true,
															}}
															style={{
																width: "100%",
																maxHeight: 600,
															}}
														>
															{projeto.imagem_destaque && (
																<SwiperSlide key="imagem-destaque">
																	<img
																		src={
																			projeto.imagem_destaque
																		}
																		alt={
																			projeto.titulo
																		}
																		style={{
																			width: "100%",
																			maxHeight: 600,
																			objectFit:
																				"cover",
																		}}
																	/>
																</SwiperSlide>
															)}
															{projeto.anexos?.map(
																(
																	anexo: any
																) => (
																	<SwiperSlide
																		key={
																			anexo.id
																		}
																	>
																		<img
																			src={
																				anexo.valor
																			}
																			alt={
																				anexo.nome
																			}
																			style={{
																				width: "100%",
																				maxHeight: 600,
																				objectFit:
																					"cover",
																			}}
																		/>
																	</SwiperSlide>
																)
															)}
														</Swiper>
													) : (
														<img
															src="/assets/img/default-post.jpg"
															alt=""
															style={{
																width: "100%",
																maxHeight: 600,
																objectFit:
																	"cover",
															}}
														/>
													)}
												</div>
												<div className="postbox__content">
													<div className="postbox__meta">
														<span>
															<i className="far fa-calendar-check"></i>{" "}
															{new Date(
																projeto.publicado_em!
															).toLocaleDateString()}
														</span>
														<span>
															<a href="#">
																<i className="far fa-user"></i>{" "}
																{projeto.autor_nome ??
																	"Utilizador"}
															</a>
														</span>
														<span>
															<a href="#">
																<i className="fal fa-comments"></i>{" "}
																{comentarios?.length ==
																1
																	? `1 ${t(
																			"comments.comment"
																	  )}`
																	: `${
																			comentarios?.length ||
																			0
																	  } ${t(
																			"comments.comments"
																	  )}`}
															</a>
														</span>
													</div>
													<h3
														className="postbox__title"
														dangerouslySetInnerHTML={{
															__html:
																projeto.titulo ??
																"",
														}}
													></h3>
													{projeto.subtitulo ? (
														<h4
															className="postbox__subtitle"
															dangerouslySetInnerHTML={{
																__html:
																	projeto.subtitulo ??
																	"",
															}}
															style={{
																fontSize:
																	"1.05rem",
																marginTop:
																	"0.5rem",
																fontWeight: 500,
																color: "#666",
															}}
														/>
													) : null}
													<div
														className="postbox__text mb-40"
														dangerouslySetInnerHTML={{
															__html:
																projeto.conteudo ??
																"",
														}}
													/>
													<div className="postbox__line"></div>
													<div className="postbox__meta-3 d-sm-flex align-items-center">
														<span>
															{t("tags.title")} :
														</span>
														<div className="tagcloud">
															{projeto.tags &&
																projeto.tags.map(
																	etiqueta => (
																		<a
																			key={
																				etiqueta.id
																			}
																			href="#"
																		>
																			{
																				etiqueta.nome
																			}
																		</a>
																	)
																)}
														</div>
													</div>
												</div>
											</div>
											<div className="latest-comments mb-65">
												<h3>
													{comentarios?.length == 1
														? `1 ${t(
																"comments.comment"
														  )}`
														: `${
																comentarios?.length ||
																0
														  } ${t(
																"comments.comments"
														  )}`}
												</h3>
												{comentarios &&
												comentarios.length > 0 ? (
													<ul>
														{comentarios
															.filter(
																(
																	comment: ComentarioPublico
																) =>
																	!comment.comentario_pai_id
															)
															.map(
																(
																	comment: ComentarioPublico
																) => {
																	const authorName =
																		comment.utilizador_nome ||
																		t(
																			"comments.guest"
																		);
																	const avatarUrl =
																		comment.utilizador_foto ||
																		"";

																	return (
																		<li
																			key={
																				comment.id
																			}
																		>
																			<div className="comments-box grey-bg-2">
																				<div className="comments-info d-flex">
																					<div className="comments-avatar mr-20">
																						<Avatar
																							src={
																								avatarUrl
																							}
																							name={
																								authorName
																							}
																							alt={
																								authorName
																							}
																							size={
																								50
																							}
																						/>
																					</div>
																					<div className="avatar-name">
																						<h5>
																							{
																								authorName
																							}
																						</h5>
																						<span className="post-meta">
																							{new Date(
																								comment.criado_em
																							).toLocaleDateString()}
																						</span>
																					</div>
																				</div>
																				<div className="comments-text ml-65">
																					<p>
																						{
																							comment.conteudo
																						}
																					</p>
																				</div>
																			</div>

																			{/* Comentario Pai implementar depois
                                    {comment.respostas && comment.respostas.length > 0 && (
                                      <ul>
                                        {comment.respostas.map((reply: Comentario) => (
                                          <li key={reply.id} className="children">
                                            <div className="comments-box grey-bg-2">
                                              <div className="comments-info d-flex">
                                                <div className="comments-avatar mr-20">
                                                  <img
                                                    src={reply.utilizador?.anexo?.valor}
                                                    alt={reply.utilizador?.nome ?? reply.utilizador?.username ?? 'Utilizador'}
                                                  />
                                                </div>
                                                <div className="avatar-name">
                                                  <h5>{reply.utilizador?.nome ?? reply.utilizador?.username ?? 'Utilizador'}</h5>
                                                  <span className="post-meta">
                                                    {new Date(reply.criado_em).toLocaleDateString()}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="comments-text ml-65">
                                                <p>{reply.texto}</p>
                                                <div className="comments-replay">
                                                  <a href="#">Responder</a>
                                                </div>
                                              </div>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                    */}
																		</li>
																	);
																}
															)}
													</ul>
												) : (
													<p className="text-muted">
														{t("comments.empty")}
													</p>
												)}
											</div>
											{/* FormArea */}
											<FormArea
												conteudoId={projeto?.id ?? ""}
											/>
										</div>
									</div>
									{/* ProjetoRightSide */}
									<RightSide />
								</div>
							</div>
						</section>
					)}
				</>
			)}
		</>
	);
};

export default DetailsArea;
