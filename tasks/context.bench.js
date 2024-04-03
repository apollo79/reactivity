/* IMPORT */

import { createEffect, getContext } from "#/dist/mod.js";

/* HELPERS */

const symbol = Symbol();
const wrap = (fn) => createEffect(fn, { sync: true });

/* MAIN */

Deno.bench("context", () => {
  wrap(() =>
    wrap(() =>
      wrap(() =>
        wrap(() =>
          wrap(() =>
            wrap(() =>
              wrap(() =>
                wrap(() =>
                  wrap(() =>
                    wrap(() =>
                      wrap(() =>
                        wrap(() =>
                          wrap(() =>
                            wrap(() =>
                              wrap(() =>
                                wrap(() =>
                                  wrap(() =>
                                    wrap(() =>
                                      wrap(() =>
                                        wrap(() =>
                                          wrap(() =>
                                            wrap(() =>
                                              wrap(() =>
                                                wrap(() =>
                                                  wrap(() =>
                                                    wrap(() =>
                                                      wrap(() =>
                                                        wrap(() =>
                                                          wrap(() =>
                                                            wrap(() =>
                                                              wrap(() =>
                                                                wrap(() =>
                                                                  wrap(() =>
                                                                    wrap(() =>
                                                                      wrap(() =>
                                                                        wrap(
                                                                          () =>
                                                                            wrap(
                                                                              () =>
                                                                                wrap(
                                                                                  () =>
                                                                                    wrap(
                                                                                      () =>
                                                                                        wrap(
                                                                                          () =>
                                                                                            wrap(
                                                                                              () =>
                                                                                                wrap(
                                                                                                  () =>
                                                                                                    wrap(
                                                                                                      () =>
                                                                                                        wrap(
                                                                                                          () =>
                                                                                                            wrap(
                                                                                                              () =>
                                                                                                                wrap(
                                                                                                                  () =>
                                                                                                                    wrap(
                                                                                                                      () =>
                                                                                                                        wrap(
                                                                                                                          () =>
                                                                                                                            wrap(
                                                                                                                              () =>
                                                                                                                                wrap(
                                                                                                                                  () =>
                                                                                                                                    wrap(
                                                                                                                                      () =>
                                                                                                                                        wrap(
                                                                                                                                          () =>
                                                                                                                                            wrap(
                                                                                                                                              () =>
                                                                                                                                                wrap(
                                                                                                                                                  () =>
                                                                                                                                                    wrap(
                                                                                                                                                      () =>
                                                                                                                                                        wrap(
                                                                                                                                                          () =>
                                                                                                                                                            wrap(
                                                                                                                                                              () =>
                                                                                                                                                                wrap(
                                                                                                                                                                  () =>
                                                                                                                                                                    wrap(
                                                                                                                                                                      () =>
                                                                                                                                                                        wrap(
                                                                                                                                                                          () =>
                                                                                                                                                                            wrap(
                                                                                                                                                                              () =>
                                                                                                                                                                                wrap(
                                                                                                                                                                                  () =>
                                                                                                                                                                                    wrap(
                                                                                                                                                                                      () =>
                                                                                                                                                                                        wrap(
                                                                                                                                                                                          () =>
                                                                                                                                                                                            wrap(
                                                                                                                                                                                              () =>
                                                                                                                                                                                                wrap(
                                                                                                                                                                                                  () =>
                                                                                                                                                                                                    wrap(
                                                                                                                                                                                                      () =>
                                                                                                                                                                                                        wrap(
                                                                                                                                                                                                          () =>
                                                                                                                                                                                                            wrap(
                                                                                                                                                                                                              () =>
                                                                                                                                                                                                                wrap(
                                                                                                                                                                                                                  () =>
                                                                                                                                                                                                                    wrap(
                                                                                                                                                                                                                      () =>
                                                                                                                                                                                                                        wrap(
                                                                                                                                                                                                                          () =>
                                                                                                                                                                                                                            wrap(
                                                                                                                                                                                                                              () =>
                                                                                                                                                                                                                                wrap(
                                                                                                                                                                                                                                  () =>
                                                                                                                                                                                                                                    wrap(
                                                                                                                                                                                                                                      () =>
                                                                                                                                                                                                                                        wrap(
                                                                                                                                                                                                                                          () =>
                                                                                                                                                                                                                                            wrap(
                                                                                                                                                                                                                                              () =>
                                                                                                                                                                                                                                                wrap(
                                                                                                                                                                                                                                                  () =>
                                                                                                                                                                                                                                                    wrap(
                                                                                                                                                                                                                                                      () =>
                                                                                                                                                                                                                                                        wrap(
                                                                                                                                                                                                                                                          () =>
                                                                                                                                                                                                                                                            wrap(
                                                                                                                                                                                                                                                              () =>
                                                                                                                                                                                                                                                                wrap(
                                                                                                                                                                                                                                                                  () =>
                                                                                                                                                                                                                                                                    wrap(
                                                                                                                                                                                                                                                                      () =>
                                                                                                                                                                                                                                                                        wrap(
                                                                                                                                                                                                                                                                          () =>
                                                                                                                                                                                                                                                                            wrap(
                                                                                                                                                                                                                                                                              () =>
                                                                                                                                                                                                                                                                                wrap(
                                                                                                                                                                                                                                                                                  () =>
                                                                                                                                                                                                                                                                                    wrap(
                                                                                                                                                                                                                                                                                      () =>
                                                                                                                                                                                                                                                                                        wrap(
                                                                                                                                                                                                                                                                                          () =>
                                                                                                                                                                                                                                                                                            wrap(
                                                                                                                                                                                                                                                                                              () =>
                                                                                                                                                                                                                                                                                                wrap(
                                                                                                                                                                                                                                                                                                  () =>
                                                                                                                                                                                                                                                                                                    wrap(
                                                                                                                                                                                                                                                                                                      () =>
                                                                                                                                                                                                                                                                                                        wrap(
                                                                                                                                                                                                                                                                                                          () =>
                                                                                                                                                                                                                                                                                                            wrap(
                                                                                                                                                                                                                                                                                                              () =>
                                                                                                                                                                                                                                                                                                                wrap(
                                                                                                                                                                                                                                                                                                                  () =>
                                                                                                                                                                                                                                                                                                                    wrap(
                                                                                                                                                                                                                                                                                                                      () =>
                                                                                                                                                                                                                                                                                                                        wrap(
                                                                                                                                                                                                                                                                                                                          () =>
                                                                                                                                                                                                                                                                                                                            wrap(
                                                                                                                                                                                                                                                                                                                              () =>
                                                                                                                                                                                                                                                                                                                                wrap(
                                                                                                                                                                                                                                                                                                                                  () =>
                                                                                                                                                                                                                                                                                                                                    wrap(
                                                                                                                                                                                                                                                                                                                                      () =>
                                                                                                                                                                                                                                                                                                                                        wrap(
                                                                                                                                                                                                                                                                                                                                          () => {
                                                                                                                                                                                                                                                                                                                                            console
                                                                                                                                                                                                                                                                                                                                              .time(
                                                                                                                                                                                                                                                                                                                                                "lookup",
                                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                                            for (
                                                                                                                                                                                                                                                                                                                                              let i =
                                                                                                                                                                                                                                                                                                                                                  0,
                                                                                                                                                                                                                                                                                                                                                l =
                                                                                                                                                                                                                                                                                                                                                  1_000_000;
                                                                                                                                                                                                                                                                                                                                              i <
                                                                                                                                                                                                                                                                                                                                                l;
                                                                                                                                                                                                                                                                                                                                              i++
                                                                                                                                                                                                                                                                                                                                            ) {
                                                                                                                                                                                                                                                                                                                                              wrap(
                                                                                                                                                                                                                                                                                                                                                () => {
                                                                                                                                                                                                                                                                                                                                                  getContext(
                                                                                                                                                                                                                                                                                                                                                    symbol,
                                                                                                                                                                                                                                                                                                                                                  );
                                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                            console
                                                                                                                                                                                                                                                                                                                                              .timeEnd(
                                                                                                                                                                                                                                                                                                                                                "lookup",
                                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                                          },
                                                                                                                                                                                                                                                                                                                                        ),
                                                                                                                                                                                                                                                                                                                                    ),
                                                                                                                                                                                                                                                                                                                                ),
                                                                                                                                                                                                                                                                                                                            ),
                                                                                                                                                                                                                                                                                                                        ),
                                                                                                                                                                                                                                                                                                                    ),
                                                                                                                                                                                                                                                                                                                ),
                                                                                                                                                                                                                                                                                                            ),
                                                                                                                                                                                                                                                                                                        ),
                                                                                                                                                                                                                                                                                                    ),
                                                                                                                                                                                                                                                                                                ),
                                                                                                                                                                                                                                                                                            ),
                                                                                                                                                                                                                                                                                        ),
                                                                                                                                                                                                                                                                                    ),
                                                                                                                                                                                                                                                                                ),
                                                                                                                                                                                                                                                                            ),
                                                                                                                                                                                                                                                                        ),
                                                                                                                                                                                                                                                                    ),
                                                                                                                                                                                                                                                                ),
                                                                                                                                                                                                                                                            ),
                                                                                                                                                                                                                                                        ),
                                                                                                                                                                                                                                                    ),
                                                                                                                                                                                                                                                ),
                                                                                                                                                                                                                                            ),
                                                                                                                                                                                                                                        ),
                                                                                                                                                                                                                                    ),
                                                                                                                                                                                                                                ),
                                                                                                                                                                                                                            ),
                                                                                                                                                                                                                        ),
                                                                                                                                                                                                                    ),
                                                                                                                                                                                                                ),
                                                                                                                                                                                                            ),
                                                                                                                                                                                                        ),
                                                                                                                                                                                                    ),
                                                                                                                                                                                                ),
                                                                                                                                                                                            ),
                                                                                                                                                                                        ),
                                                                                                                                                                                    ),
                                                                                                                                                                                ),
                                                                                                                                                                            ),
                                                                                                                                                                        ),
                                                                                                                                                                    ),
                                                                                                                                                                ),
                                                                                                                                                            ),
                                                                                                                                                        ),
                                                                                                                                                    ),
                                                                                                                                                ),
                                                                                                                                            ),
                                                                                                                                        ),
                                                                                                                                    ),
                                                                                                                                ),
                                                                                                                            ),
                                                                                                                        ),
                                                                                                                    ),
                                                                                                                ),
                                                                                                            ),
                                                                                                        ),
                                                                                                    ),
                                                                                                ),
                                                                                            ),
                                                                                        ),
                                                                                    ),
                                                                                ),
                                                                            ),
                                                                        )
                                                                      )
                                                                    )
                                                                  )
                                                                )
                                                              )
                                                            )
                                                          )
                                                        )
                                                      )
                                                    )
                                                  )
                                                )
                                              )
                                            )
                                          )
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
});
