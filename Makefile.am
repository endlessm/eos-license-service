AM_DISTCHECK_CONFIGURE_FLAGS = \
	--with-systemdsystemunitdir=$$dc_install_base/$(systemdsystemunitdir) \
	$(NULL)

jsdir = $(pkgdatadir)
dist_js_DATA = \
	licenseApp.js \
	licenseCrawler.js \
	$(NULL)

filename = "Endless-Terms-of-Use.docx"
targetfilename = "Endless-Terms-of-Use.pdf"
TERMS_LANGUAGES=$(shell ls $(srcdir)/terms)
TERMS_PDF_FILES=$(shell LANGUAGES="$(TERMS_LANGUAGES)"; for language in $$LANGUAGES; do find $(srcdir)/terms/$$language/$(targetfilename); done)

generate-pdfs:
	for language in $(TERMS_LANGUAGES); do \
		echo -e "Generating PDF files for $$language"; \
		$(UNOCONV) -f pdf -o $(srcdir)/terms/$$language/$(targetfilename) $(srcdir)/terms/$$language/$(filename); \
	done

pdfdir = $(pkgdatadir)
nobase_dist_pdf_DATA = $(TERMS_PDF_FILES)

eos-license-service.service: eos-license-service.service.in Makefile
	@sed -e "s|\@pkgdatadir\@|$(pkgdatadir)|g" $< > $@
systemdsystemunit_DATA = eos-license-service.service
dist_systemdsystemunit_DATA = eos-license-service.socket

EXTRA_DIST = \
	eos-license-service.service.in \
	$(NULL)
CLEANFILES = eos-license-service.service

MAINTAINERCLEANFILES = \
	$(GITIGNORE_MAINTAINERCLEANFILES_TOPLEVEL) \
	$(GITIGNORE_MAINTAINERCLEANFILES_MAKEFILE_IN) \
	$(GITIGNORE_MAINTAINERCLEANFILES_M4_LIBTOOL) \
	$(NULL)

-include $(top_srcdir)/git.mk
