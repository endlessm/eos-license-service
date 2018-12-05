AM_DISTCHECK_CONFIGURE_FLAGS = \
	--with-systemdsystemunitdir=$$dc_install_base/$(systemdsystemunitdir) \
	$(NULL)

jsdir = $(pkgdatadir)
dist_js_DATA = \
	licenseApp.js \
	licenseCrawler.js \
	$(NULL)

filename = "Terms-of-Use.docx"
targetfilename = "Terms-of-Use.pdf"
TERMS_SRC_FILES=$(shell find $(srcdir)/terms -name $(filename))
TERMS_PDF_FILES=$(shell find $(srcdir)/terms -name $(targetfilename))

generate-pdfs:
	for srctermpath in $(TERMS_SRC_FILES); do \
		echo -e "Generating PDF files for $$srctermpath"; \
		$(UNOCONV) -f pdf -o $$(dirname $$srctermpath)/$(targetfilename) $$srctermpath; \
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
