DISTCHECK_CONFIGURE_FLAGS = \
	--with-systemdsystemunitdir=$$dc_install_base/$(systemdsystemunitdir) \
	$(NULL)

jsdir = $(pkgdatadir)
dist_js_DATA = \
	licenseApp.js \
	licenseCrawler.js \
	$(NULL)

filename = "Endless-Mobile-Terms-of-Use.docx"
targetfilename = "Endless-Mobile-Terms-of-Use.pdf"
TERMS_LANGUAGES=$(shell ls $(srcdir)/terms)
TERMS_ORIG_FILES=$(shell LANGUAGES="$(TERMS_LANGUAGES)"; for language in $$LANGUAGES; do find $(srcdir)/terms/$$language/$(filename); done)

install-data-local:
	for language in $(TERMS_LANGUAGES); do \
		echo -e "Generating PDF files for $$language"; \
		$(MKDIR_P) $(DESTDIR)$(pkgdatadir)/terms/$$language; \
		$(UNOCONV) -p 5432 -f pdf -o $(DESTDIR)$(pkgdatadir)/terms/$$language/$(targetfilename) $(srcdir)/terms/$$language/$(filename); \
	done

uninstall-local:
	for language in $(TERMS_LANGUAGES); do \
		rm -f $(DESTDIR)$(pkgdatadir)/terms/$$language/$(targetfilename); \
	done

eos-license-service.service: eos-license-service.service.in Makefile
	@sed -e "s|\@pkgdatadir\@|$(pkgdatadir)|" $< > $@
systemdsystemunit_DATA = eos-license-service.service
dist_systemdsystemunit_DATA = eos-license-service.socket

EXTRA_DIST = \
	eos-license-service.service.in \
	$(TERMS_ORIG_FILES) \
	$(NULL)
CLEANFILES = eos-license-service.service

MAINTAINERCLEANFILES = \
	$(GITIGNORE_MAINTAINERCLEANFILES_TOPLEVEL) \
	$(GITIGNORE_MAINTAINERCLEANFILES_MAKEFILE_IN) \
	$(GITIGNORE_MAINTAINERCLEANFILES_M4_LIBTOOL) \
	$(NULL)

-include $(top_srcdir)/git.mk
